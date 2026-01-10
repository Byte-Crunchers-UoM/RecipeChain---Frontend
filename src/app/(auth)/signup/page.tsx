"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import { UserRole } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [error, setError] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const { setSelectedRole: setContextRole, login, isWeb3AuthInitialized, userInfo } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      // Redirect to role selection page after signup
      router.push('/role-select');
    }
  }, [isConnected, router]);

  const handleSignup = async () => {
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setError('');
      setConnectLoading(true);
      setContextRole('seller');
      // Call the actual Web3Auth login
      await login();
      setIsConnected(true);
    } catch (err) {
      console.error('Signup failed:', err);
      setError('Failed to create account. Please try again.');
      setConnectLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] py-12">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/images/recipechain_logo_green.png" 
              alt="RecipeChain Logo" 
              width={120} 
              height={120}
              priority
              className="w-28 h-28 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#0d9488] mb-2">RecipeChain</h1>
          <p className="text-[#4b5563] text-base font-medium">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#e5e7eb] shadow-sm">
          <div className="space-y-6">
            {/* Onboarding Info */}
            <div className="p-4 rounded-lg bg-[#d1fae5] border border-[#a7f3d0]">
              <p className="text-[#047857] text-sm">
                After connecting your Web3 wallet, choose your preferred role — Seller or Buyer — to continue.
                Next, you'll be guided through a brief, role-specific onboarding form to provide the key details needed to personalize your experience.
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#d1d5db] bg-white text-[#0d9488] focus:ring-2 focus:ring-[#0d9488]"
              />
              <label htmlFor="terms" className="text-[#6b7280] text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-[#0d9488] hover:underline font-medium">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#0d9488] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-[#fee2e2] border border-[#fecaca]">
                <p className="text-[#dc2626] text-sm">{error}</p>
              </div>
            )}

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={connectLoading || !acceptTerms}
              className="w-full py-3 px-6 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
            <div className="text-center pt-4 border-t border-[#e5e7eb]">
              <p className="text-[#6b7280] text-sm">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-[#0d9488] font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-4">
          {/* Security Footer */}
          <div className="text-center">
            <p className="text-[#9ca3af] text-xs">
              No password required • Secured by Web3Auth
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="text-center">
            <p className="text-[#9ca3af] text-xs">
              <Link href="#" className="hover:text-[#0d9488] transition-colors">
                Terms of Service
              </Link>
              {' '} • {' '}
              <Link href="#" className="hover:text-[#0d9488] transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
