"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/lib/web3/Web3AuthProvider';
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { UserRole } from '@/types';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const { setSelectedRole: setContextRole } = useWeb3Auth();
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      // Save role to cookies and localStorage (always seller)
      localStorage.setItem('recipe_chain_role', 'seller');
      document.cookie = `recipe_chain_role=seller; path=/; max-age=86400; SameSite=Lax`;
      
      // Redirect to seller dashboard
      router.push('/seller/dashboard');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (connectError) {
      setError('Failed to connect. Please try again.');
    }
  }, [connectError]);

  const handleLogin = async () => {
    try {
      setError('');
      setContextRole('seller');
      await connect();
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to connect. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/recipechain_logo_green.png" alt="RecipeChain" className="h-20 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-teal-700 mb-2">RecipeChain</h1>
          <p className="text-gray-600 text-base">Sign in to Block-Chain powered Recipe Marketplace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* Info Box */}
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
              <p className="text-teal-700 text-sm flex items-start gap-2">
                <span className="text-lg">🔐</span>
                <span>A secure blockchain wallet will be created automatically after login.</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={connectLoading}
              className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect with Web3Auth'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                >
                  Create an account →
                </Link>
              </p>
            </div>

            {/* Admin Login Link */}
            <div className="text-center pt-2">
              <Link 
                href="/admin-login" 
                className="text-gray-600 text-sm hover:text-gray-800 transition-colors"
              >
                Login as Admin →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
