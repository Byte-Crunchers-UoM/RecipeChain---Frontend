"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import Image from 'next/image';
import Link from 'next/link';

export default function RoleSelectPage() {
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setSelectedRole: setContextRole, user } = useWeb3Auth();

  // Check if user is authenticated with Web3Auth before showing role selection
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6b7280] mb-4">Please sign up with Web3Auth first</p>
          <Link href="/signup" className="text-[#0d9488] hover:underline font-semibold">
            Go to Signup →
          </Link>
        </div>
      </div>
    );
  }

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    try {
      setIsSubmitting(true);
      
      // Set the selected role in context
      setContextRole(selectedRole as 'seller' | 'buyer');
      
      // Save role to localStorage
      localStorage.setItem('recipechain_role', selectedRole);
      
      // Route to appropriate onboarding page
      if (selectedRole === 'seller') {
        router.push('/chef-kyc');
      } else {
        router.push('/buyer-details');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/images/recipechain_logo_green.png" 
              alt="RecipeChain Logo" 
              width={100} 
              height={100}
              priority
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#0d9488] mb-4">Choose Your Role</h1>
          <p className="text-[#4b5563] text-lg">
            Join RecipeChain as a Seller to share your recipes or as a Buyer to discover amazing dishes
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Seller Card */}
          <div
            onClick={() => setSelectedRole('seller')}
            className={`p-8 rounded-xl border-2 cursor-pointer transition-all ${
              selectedRole === 'seller'
                ? 'border-[#0d9488] bg-[#d1fae5] shadow-lg'
                : 'border-[#e5e7eb] bg-white hover:border-[#0d9488]'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">👨‍🍳</span>
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Seller</h2>
              <p className="text-center text-gray-600 mb-4">
                Share your culinary creations and build your cooking brand with our community
              </p>
              <ul className="text-sm text-gray-700 space-y-2 w-full">
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Share your recipes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Build your seller profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Earn rewards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Requires verification</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buyer Card */}
          <div
            onClick={() => setSelectedRole('buyer')}
            className={`p-8 rounded-xl border-2 cursor-pointer transition-all ${
              selectedRole === 'buyer'
                ? 'border-[#0d9488] bg-[#d1fae5] shadow-lg'
                : 'border-[#e5e7eb] bg-white hover:border-[#0d9488]'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">👤</span>
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Buyer</h2>
              <p className="text-center text-gray-600 mb-4">
                Discover amazing recipes, save favorites, and follow your favorite sellers
              </p>
              <ul className="text-sm text-gray-700 space-y-2 w-full">
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Explore recipes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Save favorites</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Instant access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>No verification needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/signup')}
            className="flex-1 py-3 px-6 bg-[#e5e7eb] text-[#111827] rounded-xl font-semibold hover:bg-[#d1d5db] transition-all"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting}
            className="flex-1 py-3 px-6 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
