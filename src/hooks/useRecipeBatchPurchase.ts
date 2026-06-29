//src/hooks/useRecipeBatchPurchase.ts
import { useState } from 'react';
import { Client, xrpToDrops, Payment } from 'xrpl';
import { getXrplWalletFromWeb3AuthPrivKey } from '@/lib/xrpl/getXrplWallet';
import { getCheckoutQuote, unlockRecipesBatch } from '@/services/recipeService';

export type BatchPurchaseStatus = 'idle' | 'quoting' | 'processing' | 'unauthenticated' | 'success' | 'error';

interface CheckoutQuote {
  payableItems: { recipe_id: string; title: string; price: number }[];
  skippedItems: { recipe_id: string; title: string; reason: string }[];
  totalDue: number;
}

export function useRecipeBatchPurchase() {
  const [status, setStatus] = useState<BatchPurchaseStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [result, setResult] = useState<{ unlocked: string[]; duplicates: string[] } | null>(null);

  const resetState = () => {
    setStatus('idle');
    setErrorMsg(null);
    setQuote(null);
    setResult(null);
  };

  /** Loads pricing for the modal before the user commits to paying. */
  const loadQuote = async (recipeIds: string[]) => {
    setStatus('quoting');
    setErrorMsg(null);
    try {
      const q = await getCheckoutQuote(recipeIds);
      setQuote(q);
      setStatus('idle');
      return q;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to calculate total');
      setStatus('error');
      return null;
    }
  };

  /**
   * Checks the wallet's actual spendable balance (total balance minus the
   * XRPL account reserve minus a fee buffer) BEFORE building a transaction.
   * This is what turns a cryptic "tecUNFUNDED_PAYMENT" ledger rejection
   * into a clear, specific message — important for batch checkout since
   * the total here can be much larger than any single past purchase.
   */
  const getAvailableXrp = async (client: Client, address: string): Promise<number> => {
    const balanceXrp = Number(await client.getXrpBalance(address));

    const accountInfo = await client.request({ command: 'account_info', account: address });
    const ownerCount = accountInfo.result.account_data.OwnerCount || 0;

    const serverInfo = await client.request({ command: 'server_info' });
    const baseReserve = serverInfo.result.info.validated_ledger?.reserve_base_xrp ?? 1;
    const ownerReserve = serverInfo.result.info.validated_ledger?.reserve_inc_xrp ?? 0.2;

    const reserved = baseReserve + ownerCount * ownerReserve;
    const feeBuffer = 0.0001; // generous headroom for the network fee

    return balanceXrp - reserved - feeBuffer;
  };

  const executeBatchPurchase = async (recipeIds: string[], provider: any) => {
    setStatus('processing');
    setErrorMsg(null);

    if (!provider) {
      setStatus('unauthenticated');
      return;
    }

    // Always re-quote right before paying — prices/ownership may have
    // changed since the modal was opened.
    let freshQuote: CheckoutQuote;
    try {
      freshQuote = await getCheckoutQuote(recipeIds);
      setQuote(freshQuote);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to calculate total');
      setStatus('error');
      return;
    }

    if (freshQuote.totalDue <= 0) {
      setErrorMsg('All selected recipes are free or already owned — nothing to pay for.');
      setStatus('error');
      return;
    }

    const networkUrl = process.env.NEXT_PUBLIC_XRPL_NETWORK as string;
    const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS as string;

    if (!platformAddress || !networkUrl) {
      setErrorMsg('System configuration error. Please contact support.');
      setStatus('error');
      return;
    }

    const client = new Client(networkUrl);

    try {
      await client.connect();

      const privateKey = (await provider.request({ method: 'private_key' })) as string;
      const userWallet = await getXrplWalletFromWeb3AuthPrivKey(privateKey);

      // --- Pre-flight balance check ---
      // Catches the "total is bigger than any single past purchase" case
      // with a precise, friendly message instead of a ledger rejection.
      try {
        const available = await getAvailableXrp(client, userWallet.classicAddress);
        if (available < freshQuote.totalDue) {
          throw new Error(
            `Insufficient XRP balance. This checkout requires ${freshQuote.totalDue} XRP, but only ` +
            `${Math.max(available, 0).toFixed(2)} XRP is available in your wallet after the account reserve.`
          );
        }
      } catch (balanceCheckErr: any) {
        // If the balance check itself fails (e.g. brand-new unfunded
        // account, transient RPC error), don't block the flow here —
        // let the actual transaction attempt surface the real error below.
        if (balanceCheckErr?.message?.startsWith('Insufficient XRP balance')) {
          throw balanceCheckErr;
        }
      }

      const payableIds = freshQuote.payableItems.map((i) => i.recipe_id);
      const recipeIdsHex = Buffer.from(JSON.stringify(payableIds)).toString('hex');
      const actionHex = Buffer.from('BatchRecipePurchase').toString('hex');

      const tx: Payment = {
        TransactionType: 'Payment',
        Account: userWallet.classicAddress,
        Destination: platformAddress,
        Amount: xrpToDrops(freshQuote.totalDue),
        Memos: [{ Memo: { MemoType: actionHex, MemoData: recipeIdsHex } }],
      };

      const prepared = await client.autofill(tx);
      const signed = userWallet.sign(prepared);
      const submission = await client.submitAndWait(signed.tx_blob);

      const txResult =
        typeof submission?.result?.meta === 'string'
          ? submission.result.meta
          : (submission?.result?.meta as any)?.TransactionResult;

      if (submission?.result?.hash == null || txResult !== 'tesSUCCESS') {
        throw new Error(`XRPL Transaction failed. Status: ${txResult || 'Unknown'}`);
      }

      const unlockResult = await unlockRecipesBatch(payableIds, submission.result.hash);
      setResult(unlockResult);
      setStatus('success');
    } catch (error: any) {
      console.error('[useRecipeBatchPurchase] Error:', error);
      const msg = error?.message || String(error);

      if (msg.startsWith('Insufficient XRP balance')) {
        setErrorMsg(msg);
      } else if (msg.includes('Account not found') || msg.includes('actNotFound')) {
        setErrorMsg('Your wallet has not been activated. Please add XRP to fund your account first.');
      } else if (msg.includes('tecUNFUNDED_PAYMENT') || msg.includes('insufficient funds')) {
        setErrorMsg('Insufficient XRP balance to cover this entire batch. Please add more funds to your wallet.');
      } else if (msg.includes('User rejected') || msg.includes('declined')) {
        setErrorMsg('Payment was cancelled by the user.');
      } else {
        setErrorMsg(msg || 'Failed to complete purchase. Please try again.');
      }
      setStatus('error');
    } finally {
      if (client.isConnected()) await client.disconnect();
    }
  };

  return { status, errorMsg, quote, result, loadQuote, executeBatchPurchase, resetState };
}