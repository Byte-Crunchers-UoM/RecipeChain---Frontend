"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RoleSelectPage() {
  const [selectedRole, setSelectedRole] = useState<'chef' | 'buyer' | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'chef') {
      router.push('/chef-kyc');
    } else {
      router.push('/buyer-details');
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
            Join RecipeChain as a Chef to share your recipes or as a Buyer to discover amazing dishes
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Chef Card */}
          <div
            onClick={() => setSelectedRole('chef')}
            className={`p-8 rounded-xl border-2 cursor-pointer transition-all ${
              selectedRole === 'chef'
                ? 'border-[#0d9488] bg-[#d1fae5] shadow-lg'
                : 'border-[#e5e7eb] bg-white hover:border-[#0d9488]'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">👨‍🍳</span>
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Chef</h2>
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
                  <span>Build your chef profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Earn rewards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Requires admin verification</span>
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
                Discover amazing recipes, save favorites, and follow your favorite chefs
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
                  <span>Follow chefs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0d9488] mr-2">✓</span>
                  <span>Instant access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all text-white ${
            selectedRole
              ? 'bg-[#0d9488] hover:bg-[#0f766e]'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#9ca3af] text-sm">
            Want to change your role later? You can update it in settings anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
