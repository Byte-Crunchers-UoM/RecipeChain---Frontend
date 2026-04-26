'use client';

import React, { useState } from 'react';
import { Client, xrpToDrops } from 'xrpl';
import { getXrplWalletFromWeb3AuthPrivKey } from '@/lib/xrpl/getXrplWallet';
import { useWeb3Auth } from '@web3auth/modal/react';
import { AlertTriangle, X, CheckCircle, ShieldCheck, Coins } from 'lucide-react';
import { Recipe } from '@/lib/types/Recipe';

interface RecipePaymentModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecipePaymentModal({ recipe, isOpen, onClose, onSuccess }: RecipePaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { provider } = useWeb3Auth();

  if (!isOpen || !recipe) return null;

  const executePurchase = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    // Free Recipes චෙක් කිරීම
    if (!recipe.price || recipe.price <= 0) {
      setErrorMsg("This recipe is free and does not require a payment transaction.");
      setIsProcessing(false);
      return;
    }

    const networkUrl = process.env.NEXT_PUBLIC_XRPL_NETWORK || "wss://s.altnet.rippletest.net:51233";
    const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS || "rMCnGCWskZYWMd5Vr6SeCmPF1kgg2jX2tX";
    
    if (!platformAddress) {
      setErrorMsg("Platform address not configured.");
      setIsProcessing(false); 
      return;
    }

    if (!provider) {
      setErrorMsg("Web3 provider not found. Please log in again.");
      setIsProcessing(false); 
      return;
    }

    let client = new Client(networkUrl);

    try {
      await client.connect();

      // STEP 1: Get User Wallet
      const privateKey = await provider.request({ method: "private_key" }) as string;
      if (!privateKey) throw new Error("Could not get private key from Web3Auth");
      const userWallet = await getXrplWalletFromWeb3AuthPrivKey(privateKey);

      // 🛠️ Debugging සඳහා Wallet Address එක Print කිරීම
      console.log("My Web3Auth Wallet Address:", userWallet.classicAddress);

      // STEP 2: Create Transaction
      const recipeIdHex = Buffer.from(recipe.recipe_id.toString()).toString('hex');
      const actionHex = Buffer.from('RecipePurchase').toString('hex');

      const tx: any = {
        TransactionType: "Payment",
        Account: userWallet.classicAddress,
        Destination: platformAddress,
        Amount: xrpToDrops(recipe.price), // 🛠️ 'price' පාවිච්චි කර ඇත
        Memos: [{ Memo: { MemoType: actionHex, MemoData: recipeIdHex } }]
      };

      // STEP 3: Sign & Submit
      const prepared = await client.autofill(tx);
      const signed = userWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const txResult = typeof result?.result?.meta === 'string' ? result.result.meta : result?.result?.meta?.TransactionResult;
      
      if (result?.result?.hash == null || txResult !== "tesSUCCESS") {
        throw new Error(`XRPL Transaction failed. Status: ${txResult || 'Unknown'}`);
      }

      // STEP 4: Backend Verification
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${apiUrl}/recipes/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include", 
        body: JSON.stringify({ 
          recipeId: recipe.recipe_id, 
          transactionHash: result.result.hash 
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Backend verification failed.");
      }

      // Success
      onSuccess();
    } catch (error: any) {
      console.error("Purchase error:", error);
      setErrorMsg(error.message || "Failed to complete purchase. Check your balance.");
    } finally {
      await client.disconnect();
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Darkened Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 transition-opacity backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 z-10">
        <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-500" />
        
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 bg-teal-50 rounded-full flex items-center justify-center">
                <Coins size={40} className="text-teal-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <ShieldCheck size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Unlock Recipe?</h3>
            <p className="text-slate-500 mt-2 text-sm">
              Authorize a secure XRPL payment to access this premium content.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Item</span>
              <span className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{recipe.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Price</span>
              <div className="flex items-center gap-1.5">
                {/* 🛠️ මෙතනත් 'recipe.price' බව තහවුරු කර ඇත */}
                <span className="text-xl font-black text-teal-600">{recipe.price || 0}</span>
                <span className="text-xs font-bold text-teal-500">XRP</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[13px] text-amber-800 leading-snug">
              Blockchain transactions are permanent. Ensure sufficient balance before confirming.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-[13px] font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={executePurchase}
              disabled={isProcessing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle size={20} /> Confirm & Pay</>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full bg-white hover:bg-slate-50 text-slate-500 font-semibold py-4 rounded-2xl transition disabled:opacity-30"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}