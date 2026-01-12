"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/lib/web3/Web3AuthProvider';
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { UserRole } from '@/types';
import Link from 'next/link';

export default function SignupPage() {
  const [error, setError] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { setSelectedRole: setContextRole } = useWeb3Auth();
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      // Save role to cookies and localStorage (always seller for signup)
      localStorage.setItem('recipe_chain_role', 'seller');
      document.cookie = `recipe_chain_role=seller; path=/; max-age=86400; SameSite=Lax`;
      
      // Redirect to seller dashboard
      router.push('/seller/dashboard');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (connectError) {
      setError('Failed to create account. Please try again.');
    }
  }, [connectError]);

  const handleSignup = async () => {
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setError('');
      setContextRole('seller');
      await connect();
    } catch (err) {
      console.error('Signup failed:', err);
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/recipechain_logo_green.png" alt="RecipeChain" className="h-20 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-teal-700 mb-2">RecipeChain</h1>
          <p className="text-gray-600 text-base">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* Steps Info Box */}
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
              <div className="text-teal-700 text-sm space-y-2">
                <p><span className="font-semibold">Step 1:</span> Connect your Web3 wallet.</p>
                <p><span className="font-semibold">Step 2:</span> Choose your preferred role — Seller or Buyer.</p>
                <p><span className="font-semibold">Step 3:</span> Complete your profile with role-specific details.</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 bg-white text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="terms" className="text-gray-700 text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-teal-600 font-semibold hover:text-teal-700">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-teal-600 font-semibold hover:text-teal-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={connectLoading || !acceptTerms}
              className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Sign Up with Web3Auth'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                >
                  Login here →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
