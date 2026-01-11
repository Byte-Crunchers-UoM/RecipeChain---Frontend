"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const { login, setSelectedRole, isWeb3AuthInitialized, user, isUserExist } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && user.role) {
      if (user.role === 'seller') {
        router.push('/seller/dashboard');
      } else if (user.role === 'buyer') {
        router.push('/buyer/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      setError('');
      setConnectLoading(true);
      setLoadingStage('Checking account...');

      // Check if user is an existing user
      const userExists = isUserExist();

      if (userExists) {
        // Existing user - get their role and redirect to appropriate dashboard
        const storedRole = localStorage.getItem('recipechain_role');
        setSelectedRole(storedRole as 'seller' | 'buyer' | 'admin' || 'buyer');
        
        setLoadingStage('Opening Web3Auth modal...');
        // Call the actual Web3Auth login
        await login();
        
        setLoadingStage('Login successful!');
        // The useEffect will handle the redirect based on user.role
      } else {
        // New user - redirect to signup page
        setLoadingStage('Redirecting to signup...');
        router.push('/signup');
        setConnectLoading(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect with Web3Auth. Please try again.';
      setError(errorMessage);
      setConnectLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
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
          <p className="text-[#4b5563] text-base font-medium">Sign in to Block-Chain powered Recipe Marketplace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#e5e7eb] shadow-sm">
          <div className="space-y-6">
            {/* Security Message */}
            <div className="p-4 rounded-lg bg-[#d1fae5] border border-[#a7f3d0]">
              <p className="text-[#047857] text-sm font-medium">
                🔒 A secure blockchain wallet will be created automatically after login.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-[#fee2e2] border border-[#fecaca]">
                <p className="text-[#dc2626] text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={connectLoading || !isWeb3AuthInitialized}
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
              ) : (
                'Connect with Web3Auth'
              )}
            </button>

            {/* Signup Link */}
            <div className="text-center pt-4 border-t border-[#e5e7eb]">
              <p className="text-[#6b7280] text-sm mb-2">Don't have an account?</p>
              <Link 
                href="/signup" 
                className="text-[#0d9488] font-semibold hover:text-[#0f766e] transition-colors text-sm"
              >
                Create an account →
              </Link>
            </div>

            {/* Admin Login Link */}
            <div className="text-center pt-2">
              <Link 
                href="/admin-login" 
                className="text-[#6b7280] text-sm hover:text-[#0d9488] transition-colors font-medium"
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
