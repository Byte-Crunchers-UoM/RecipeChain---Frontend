//src/components/recipe/RecipePaymentModel.tsx

'use client';

import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useWeb3Auth } from '@web3auth/modal/react';
import { AlertTriangle, X, CheckCircle, ShieldCheck, Coins, PartyPopper, Lock } from 'lucide-react';
import { Recipe } from '@/lib/types/Recipe';
import { useRecipePurchase } from '@/hooks/useRecipePurchase';

interface RecipePaymentModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecipePaymentModal({ recipe, isOpen, onClose, onSuccess }: RecipePaymentModalProps) {
  const { provider } = useWeb3Auth();
  const { status, errorMsg, executePurchase, resetState } = useRecipePurchase();

  // Reset state on unmount or close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => resetState(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !recipe) return null;

  const handlePurchase = () => {
    executePurchase(recipe, provider);
  };

  const isProcessing = status === 'processing';
  const isSuccess = status === 'success';
  const isUnauthenticated = status === 'unauthenticated';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 transition-opacity backdrop-blur-sm"
        onClick={(!isProcessing && !isSuccess && !isUnauthenticated) ? onClose : undefined}
        aria-hidden="true"
      />

      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 z-10" role="dialog" aria-modal="true">
        
        {/* Top decorative bar */}
        <div className={`h-2 transition-colors duration-500 ${
          isSuccess ? 'bg-emerald-500' : isUnauthenticated ? 'bg-blue-500' : 'bg-gradient-to-r from-teal-500 to-blue-500'
        }`} />
        
        {/* Close Button */}
        {!isSuccess && !isUnauthenticated && (
          <button 
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        )}

        {isUnauthenticated ? (
          <UnauthenticatedView onClose={onClose} />
        ) : isSuccess ? (
          <SuccessView recipe={recipe} onSuccess={onSuccess} />
        ) : (
          <PaymentCheckoutView 
            recipe={recipe} 
            isProcessing={isProcessing} 
            errorMsg={errorMsg} 
            onPurchase={handlePurchase} 
            onClose={onClose} 
          />
        )}
      </div>
    </div>
  );
}

// Sub-components for cleaner reading (Best Practice: Extract large conditional returns)
function UnauthenticatedView({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const handleAuthClick = () => {
    onClose(); // Closes the modal/view
    router.push("/signup"); // Redirects to the signup page
  };

  return (
    <div className="p-10 text-center animate-in zoom-in duration-500">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100">
          <Lock size={40} className="text-blue-500" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Authentication Required</h3>
      <p className="text-slate-500 mb-8 leading-relaxed text-sm">
        You need to be logged into your account to securely purchase and save this recipe.
      </p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleAuthClick} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
        >
          Log In / Sign Up
        </button>
      </div>
    </div>
  );
}

function SuccessView({ recipe, onSuccess }: { recipe: Recipe; onSuccess: () => void }) {
  const router = useRouter();

  // Lets the parent run any side effects it needs (closing the modal,
  // refreshing purchase state, etc.) and then takes the user straight
  // to the full, now-unlocked recipe.
  const handleViewRecipe = () => {
    onSuccess();
    router.push(`/recipes/${recipe.recipe_id}`);
  };

  return (
    <div className="p-10 text-center animate-in zoom-in duration-500">
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full">
          <PartyPopper className="w-12 h-12 text-emerald-500 animate-bounce" />
        </div>
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Recipe Unlocked!</h3>
      <p className="text-slate-500 mb-8 leading-relaxed">Payment successful! You now have full lifetime access.</p>
      <button onClick={handleViewRecipe} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]">
        <CheckCircle className="w-5 h-5" /> View Full Recipe
      </button>
    </div>
  );
}

function PaymentCheckoutView({ recipe, isProcessing, errorMsg, onPurchase, onClose }: any) {
  return (
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
        <p className="text-slate-500 mt-2 text-sm">Authorize a secure XRPL payment to access this premium content.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Item</span>
          <span className="text-sm font-semibold text-slate-800 truncate max-w-[11rem]">{recipe.title}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Price</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-teal-600">{recipe.price || 0}</span>
            <span className="text-xs font-bold text-teal-500">XRP</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 text-[13px] font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button onClick={onPurchase} disabled={isProcessing} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
          {isProcessing ? (
            <><div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : (
            <><CheckCircle size={20} /> Confirm & Pay</>
          )}
        </button>
        <button onClick={onClose} disabled={isProcessing} className="w-full bg-white hover:bg-slate-50 text-slate-500 font-semibold py-4 rounded-2xl transition disabled:opacity-30">
          Cancel
        </button>
      </div>
    </div>
  );
}