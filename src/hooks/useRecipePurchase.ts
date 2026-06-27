import { useState } from 'react';
import { Client, xrpToDrops, Payment } from 'xrpl';
import { getXrplWalletFromWeb3AuthPrivKey } from '@/lib/xrpl/getXrplWallet';

// Standardized State Machine for UI prediction
export type PurchaseStatus = 'idle' | 'processing' | 'unauthenticated' | 'success' | 'error';

export function useRecipePurchase() {
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetState = () => {
    setStatus('idle');
    setErrorMsg(null);
  };

  const executePurchase = async (recipe: any, provider: any) => {
    setStatus('processing');
    setErrorMsg(null);

    // 1. Guard Clauses
    if (!provider) {
      setStatus('unauthenticated');
      return;
    }

    if (!recipe.price || recipe.price <= 0) {
      setErrorMsg("This recipe is free and does not require a payment transaction.");
      setStatus('error');
      return;
    }

    const networkUrl = process.env.NEXT_PUBLIC_XRPL_NETWORK as string;
    const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS as string;
    
    if (!platformAddress || !networkUrl) {
      setErrorMsg("System configuration error. Please contact support.");
      setStatus('error');
      return;
    }

    const client = new Client(networkUrl);

    try {
      await client.connect();

      // 2. Retrieve Wallet
      const privateKey = await provider.request({ method: "private_key" }) as string;
      const userWallet = await getXrplWalletFromWeb3AuthPrivKey(privateKey);
      
      // Tip: You can uncomment this during development to easily copy your address to the testnet faucet
      // console.log("Web3Auth Wallet Address:", userWallet.classicAddress);

      // 3. Construct Transaction
      const recipeIdHex = Buffer.from(recipe.recipe_id.toString()).toString('hex');
      const actionHex = Buffer.from('RecipePurchase').toString('hex');

      const tx: Payment = {
        TransactionType: "Payment",
        Account: userWallet.classicAddress,
        Destination: platformAddress,
        Amount: xrpToDrops(recipe.price), 
        Memos: [{ Memo: { MemoType: actionHex, MemoData: recipeIdHex } }]
      };

      // 4. Sign and Submit
      const prepared = await client.autofill(tx);
      const signed = userWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const txResult = typeof result?.result?.meta === 'string' 
        ? result.result.meta 
        : (result?.result?.meta as any)?.TransactionResult;
      
      if (result?.result?.hash == null || txResult !== "tesSUCCESS") {
        throw new Error(`XRPL Transaction failed. Status: ${txResult || 'Unknown'}`);
      }

      // 5. Backend Verification
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/recipes/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include", 
        body: JSON.stringify({ 
          recipeId: recipe.recipe_id, 
          transactionHash: result.result.hash 
        })
      });

      if (response.status === 401) {
        setStatus('unauthenticated');
        return; 
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Backend verification failed.");
      }

      setStatus('success');

    } catch (error: any) {
      console.error("[useRecipePurchase] Error:", error);
      
      const errorMessage = error?.message || String(error);
      
      // --- INDUSTRIAL STANDARD ERROR HANDLING ---
      
      // Catch Unfunded / Non-existent Accounts (The RippledError fix)
      if (errorMessage.includes('Account not found') || errorMessage.includes('actNotFound')) {
        setErrorMsg("Your wallet has not been activated. Please add XRP to fund your account first.");
      } 
      // Catch Insufficient Balances
      else if (errorMessage.includes('tecUNFUNDED_PAYMENT') || errorMessage.includes('insufficient funds')) {
        setErrorMsg("Insufficient XRP balance. Please add more funds to your wallet.");
      } 
      // Catch User Cancellations
      else if (errorMessage.includes('User rejected') || errorMessage.includes('declined')) {
        setErrorMsg("Payment was cancelled by the user.");
      } 
      // Generic Fallback
      else {
        setErrorMsg(errorMessage || "Failed to complete purchase. Please try again.");
      }
      
      setStatus('error');
    } finally {
      if (client.isConnected()) {
        await client.disconnect();
      }
    }
  };

  return { status, errorMsg, executePurchase, resetState };
}