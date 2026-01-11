"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [error, setError] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const { signup, isLoading, user } = useWeb3Auth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setConnectLoading(true);
    setLoadingStage('Opening Web3Auth modal...');
    setError('');

    try {
      // Signup with Web3Auth - includes wallet address retrieval
      console.log('Starting Web3Auth signup...');
      const result = await signup();
      console.log('Web3Auth signup result:', result);
      
      if (result && result.id) {
        console.log('Web3Auth signup successful, user:', result);
        setLoadingStage('Web3Auth signup successful!');
        setConnectLoading(false);
        
        // Redirect to role selection after successful signup with wallet
        console.log('Redirecting to role selection...');
        setTimeout(() => {
          router.push('/role-select');
        }, 1000);
      } else {
        console.log('Web3Auth signup in redirect mode or failed...');
        setConnectLoading(false);
        setLoadingStage('');
      }
    } catch (err) {
      console.error('Web3Auth signup failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up with Web3Auth. Please try again.';
      setError(errorMessage);
      setConnectLoading(false);
      setLoadingStage('');
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
                <strong>Step 1:</strong> Connect your Web3 wallet. <br/>
                <strong>Step 2:</strong> Choose your preferred role — Seller or Buyer. <br/>
                <strong>Step 3:</strong> Complete your profile with role-specific details.
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
              disabled={connectLoading || isLoading}
              title={isLoading ? "Web3Auth is initializing..." : ""}
              className="w-full py-3 px-6 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
            {connectLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>{loadingStage || 'Connecting...'}</span>
                </span>
              ) : !isLoading ? (
                'Sign Up with Web3Auth'
              ) : (
                'Initializing Web3Auth...'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-[#e5e7eb]">
              <p className="text-[#6b7280] text-sm mb-2">Already have an account?</p>
              <Link 
                href="/login" 
                className="text-[#0d9488] font-semibold hover:text-[#0f766e] transition-colors text-sm"
              >
                Login here →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
