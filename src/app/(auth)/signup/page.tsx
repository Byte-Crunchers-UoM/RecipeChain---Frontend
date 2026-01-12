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
      localStorage.setItem('park_chain_role', 'seller');
      document.cookie = `park_chain_role=seller; path=/; max-age=86400; SameSite=Lax`;
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] py-12">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-[#111827]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Park Chain</h1>
          <p className="text-[#D8D8D8] text-sm">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">Note:</span> You&apos;re creating a Seller account. You&apos;ll need to complete KYC verification with documents before listing parking slots.
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white"
              />
              <label htmlFor="terms" className="text-[#D8D8D8] text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-white hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-white hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={connectLoading || !acceptTerms}
              className="w-full py-4 px-6 bg-white text-[#111827] rounded-xl font-semibold hover:bg-[#F2F2F2] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-[#D8D8D8] text-sm">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-white font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-[#D8D8D8] text-xs">
            Secured with Web3Auth • XRPL Blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
