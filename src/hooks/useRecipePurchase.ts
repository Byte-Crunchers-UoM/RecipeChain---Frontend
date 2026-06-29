//src/hooks/useRecipePurchase.ts
import { useState } from 'react';
import { Client, xrpToDrops, Payment } from 'xrpl';
import { getXrplWalletFromWeb3AuthPrivKey } from '@/lib/xrpl/getXrplWallet';

// Standardized State Machine for UI prediction
export type PurchaseStatus = 'idle' | 'processing' | 'unauthenticated' | 'success' | 'error';

/**
 * Fallback platform wallet + network, used only if the matching
 * NEXT_PUBLIC_* env vars aren't set (e.g. a fresh local checkout that
 * hasn't had .env.local configured yet).
 *
 * IMPORTANT: this public address must match the backend's
 * XRPL_TREASURY_ADDRESS. Never put a seed/secret in frontend code.
 */
const FALLBACK_PLATFORM_XRPL_ADDRESS = "rMCnGCWskZYWMd5Vr6SeCmPF1kgg2jX2tX";
const DEFAULT_XRPL_TESTNET = "wss://s.altnet.rippletest.net:51233";

function stringToHex(value: string): string {
  // TextEncoder works in every browser without needing a Buffer polyfill.
  const bytes = new TextEncoder().encode(value);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function getXrplTransactionResult(result: unknown): string | null {
  const submitResult = result as { result?: { meta?: string | { TransactionResult?: string } } };
  const meta = submitResult?.result?.meta;
  if (typeof meta === "string") return meta;
  return meta?.TransactionResult || null;
}

function getXrplTransactionHash(result: unknown): string | null {
  const submitResult = result as { result?: { hash?: string } };
  return submitResult?.result?.hash || null;
}

async function parseBackendError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.message || data?.error || "Backend verification failed.";
  } catch {
    return "Backend verification failed.";
  }
}

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

    const recipeId = recipe?.recipe_id != null ? String(recipe.recipe_id) : "";
    const recipePrice = Number(recipe?.price);

    if (!recipeId) {
      setErrorMsg("Recipe ID is missing. Please refresh and try again.");
      setStatus('error');
      return;
    }

    if (!recipePrice || recipePrice <= 0) {
      setErrorMsg("This recipe is free and does not require a payment transaction.");
      setStatus('error');
      return;
    }

    const networkUrl = process.env.NEXT_PUBLIC_XRPL_NETWORK?.trim() || DEFAULT_XRPL_TESTNET;
    const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS?.trim() || FALLBACK_PLATFORM_XRPL_ADDRESS;

    const client = new Client(networkUrl);

    try {
      await client.connect();

      // 2. Retrieve Wallet
      const privateKey = (await provider.request({ method: "private_key" })) as string;
      if (!privateKey) {
        throw new Error("Could not get private key from Web3Auth");
      }
      const userWallet = await getXrplWalletFromWeb3AuthPrivKey(privateKey);

      // Tip: uncomment during development to copy your address to the testnet faucet
      // console.log("Web3Auth Wallet Address:", userWallet.classicAddress);

      // 3. Construct Transaction
      const recipeIdHex = stringToHex(recipeId);
      const actionHex = stringToHex('RecipePurchase');

      const tx: Payment = {
        TransactionType: "Payment",
        Account: userWallet.classicAddress,
        Destination: platformAddress,
        Amount: xrpToDrops(String(recipePrice)),
        Memos: [{ Memo: { MemoType: actionHex, MemoData: recipeIdHex } }]
      };

      // 4. Sign and Submit
      const prepared = await client.autofill(tx);
      const signed = userWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const txHash = getXrplTransactionHash(result);
      const txResult = getXrplTransactionResult(result);

      if (!txHash || txResult !== "tesSUCCESS") {
        throw new Error(`XRPL Transaction failed. Status: ${txResult || 'Unknown'}`);
      }

      // 5. Backend Verification
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${apiUrl}/recipes/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          recipeId,
          transactionHash: txHash
        })
      });

      if (response.status === 401) {
        setStatus('unauthenticated');
        return;
      }

      if (!response.ok) {
        const backendError = await parseBackendError(response);
        throw new Error(backendError);
      }

      // Let the rest of the app react to a successful purchase (wallet
      // balance widget, buyer profile, etc.) without coupling them to
      // this hook directly.
      window.dispatchEvent(new CustomEvent("recipe-purchased-successfully", {
        detail: { recipeId, title: recipe?.title || "Recipe", amount: recipePrice, transactionHash: txHash }
      }));
      window.dispatchEvent(new Event("recipechain-wallet-refresh"));
      window.dispatchEvent(new Event("buyer-profile-updated"));

      setStatus('success');

    } catch (error: any) {
      console.error("[useRecipePurchase] Error:", error);

      const errorMessage = error?.message || String(error);
      const lowerMsg = errorMessage.toLowerCase();

      // --- INDUSTRIAL STANDARD ERROR HANDLING ---
      if (errorMessage.includes('Account not found') || errorMessage.includes('actNotFound')) {
        setErrorMsg("Your wallet has not been activated. Please add XRP to fund your account first.");
      } else if (errorMessage.includes('tecUNFUNDED_PAYMENT') || lowerMsg.includes('insufficient funds')) {
        setErrorMsg("You do not have enough XRP to buy this recipe. Please top up your wallet and try again.");
      } else if (lowerMsg.includes('user rejected') || lowerMsg.includes('declined') || lowerMsg.includes('cancelled')) {
        setErrorMsg("Payment was cancelled by the user.");
      } else if (lowerMsg.includes('already')) {
        setErrorMsg("You already purchased this recipe. Open it from My Cookbook.");
      } else if (lowerMsg.includes('destination')) {
        setErrorMsg("Payment destination mismatch. Check that the frontend platform address matches the backend XRPL_TREASURY_ADDRESS.");
      } else {
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