//src/components/recipe/RecipeBatchPaymentModal.tsx

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@web3auth/modal/react';
import { ArrowRight, CheckCircle, Coins, Lock, PartyPopper, ShieldCheck, X } from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { useRecipeBatchPurchase } from '@/hooks/useRecipeBatchPurchase';

interface RecipeBatchPaymentModalProps {
  recipes: Recipe[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (unlockedIds: string[]) => void;
}

export default function RecipeBatchPaymentModal({
  recipes,
  isOpen,
  onClose,
  onSuccess,
}: RecipeBatchPaymentModalProps) {
  const { provider } = useWeb3Auth();
  const { status, errorMsg, quote, result, loadQuote, executeBatchPurchase, resetState } =
    useRecipeBatchPurchase();

  const recipeIds = recipes.map((r) => r.recipe_id);

  useEffect(() => {
    if (isOpen && recipeIds.length > 0) {
      loadQuote(recipeIds);
    }
    if (!isOpen) {
      const timer = setTimeout(() => resetState(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Notify the parent once (e.g. to refresh purchased-state elsewhere),
  // but the modal does NOT close itself here — it stays open so the
  // user can actually see the success screen and pick a recipe to view.
  useEffect(() => {
    if (status === 'success' && result) {
      onSuccess?.(result.unlocked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!isOpen) return null;

  const isProcessing = status === 'processing' || status === 'quoting';
  const isSuccess = status === 'success';
  const isUnauthenticated = status === 'unauthenticated';

  const handlePurchase = () => executeBatchPurchase(recipeIds, provider);

  const unlockedRecipes = result
    ? recipes.filter((r) => result.unlocked.includes(r.recipe_id))
    : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing && !isSuccess && !isUnauthenticated ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`h-2 transition-colors duration-500 ${
            isSuccess ? 'bg-emerald-500' : isUnauthenticated ? 'bg-blue-500' : 'bg-gradient-to-r from-teal-500 to-blue-500'
          }`}
        />

        {!isSuccess && !isUnauthenticated && (
          <button
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close modal"
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        )}

        {isUnauthenticated ? (
          <UnauthenticatedView onClose={onClose} />
        ) : isSuccess ? (
          <SuccessView unlockedRecipes={unlockedRecipes} onClose={onClose} />
        ) : (
          <BatchCheckoutView
            quote={quote}
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

function UnauthenticatedView({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="animate-in zoom-in p-10 text-center duration-500">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50">
          <Lock size={40} className="text-blue-500" />
        </div>
      </div>
      <h3 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">Authentication Required</h3>
      <p className="mb-8 text-sm leading-relaxed text-slate-500">
        You need to be logged in to securely unlock these recipes.
      </p>
      <button
        onClick={() => {
          onClose();
          router.push('/signup');
        }}
        className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-[0.98] hover:bg-blue-700"
      >
        Log In / Sign Up
      </button>
    </div>
  );
}

function SuccessView({ unlockedRecipes, onClose }: { unlockedRecipes: Recipe[]; onClose: () => void }) {
  const router = useRouter();

  const handleViewRecipe = (recipeId: string) => {
    onClose();
    router.push(`/recipes/${recipeId}`);
  };

  return (
    <div className="animate-in zoom-in p-8 text-center duration-500">
      <div className="relative mx-auto mb-6 h-20 w-20">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <PartyPopper className="h-10 w-10 animate-bounce text-emerald-500" />
        </div>
      </div>

      <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
        {unlockedRecipes.length} Recipe{unlockedRecipes.length !== 1 ? 's' : ''} Unlocked!
      </h3>
      <p className="mb-6 leading-relaxed text-slate-500">
        Payment successful! You now have full lifetime access to all of them.
      </p>

      <div className="mb-6 max-h-64 space-y-2 overflow-y-auto text-left">
        {unlockedRecipes.map((recipe) => (
          <button
            key={recipe.recipe_id}
            onClick={() => handleViewRecipe(recipe.recipe_id)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-left transition hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.99]"
          >
            <span className="truncate text-sm font-semibold text-slate-700">{recipe.title}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-600">
              View Recipe <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full rounded-xl bg-white py-3 font-semibold text-slate-500 transition hover:bg-slate-50"
      >
        Done
      </button>
    </div>
  );
}

function BatchCheckoutView({ quote, isProcessing, errorMsg, onPurchase, onClose }: any) {
  return (
    <div className="p-8">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
            <Coins size={40} className="text-teal-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm">
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-slate-900">Unlock All Saved Recipes?</h3>
        <p className="mt-2 text-sm text-slate-500">One secure XRPL payment unlocks every item below.</p>
      </div>

      {!quote ? (
        <div className="mb-6 flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
        </div>
      ) : (
        <div className="mb-6 max-h-56 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {quote.payableItems.map((item: any) => (
            <div key={item.recipe_id} className="flex items-center justify-between py-1.5 text-sm">
              <span className="truncate pr-3 text-slate-700">{item.title}</span>
              <span className="shrink-0 font-semibold text-teal-600">{item.price} XRP</span>
            </div>
          ))}
          {quote.skippedItems.length > 0 && (
            <p className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-400">
              {quote.skippedItems.length} item(s) already owned — excluded from charge.
            </p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-teal-600">{quote.totalDue}</span>
              <span className="text-xs font-bold text-teal-500">XRP</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="animate-in fade-in mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-[13px] font-medium text-red-600 duration-200">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onPurchase}
          disabled={isProcessing || !quote || quote.totalDue <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-4 font-bold text-white shadow-lg shadow-teal-200 transition-all active:scale-[0.98] hover:bg-teal-700 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={20} /> Confirm & Pay All
            </>
          )}
        </button>
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="w-full rounded-2xl bg-white py-4 font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}