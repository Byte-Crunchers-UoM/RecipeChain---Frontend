"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ApprovalPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image 
            src="/images/recipechain_logo_green.png" 
            alt="RecipeChain Logo" 
            width={100} 
            height={100}
            priority
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#fef3c7] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Pending Approval</h1>
            <p className="text-gray-600">
              Thank you for submitting your chef profile! Your KYC verification is under review.
            </p>
          </div>

          {/* Status */}
          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <div className="text-left">
                  <p className="font-semibold text-[#111827]">Profile Submitted</p>
                  <p className="text-sm text-gray-600">All information received</p>
                </div>
              </div>
              <div className="h-px bg-[#fcd34d]"></div>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-gray-400">⏳</span>
                <div className="text-left">
                  <p className="font-semibold text-[#111827]">Under Review</p>
                  <p className="text-sm text-gray-600">Admin team is verifying your details</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#d1fae5] border border-[#a7f3d0] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#047857] mb-2">What happens next?</h3>
            <ul className="text-sm text-[#047857] space-y-2">
              <li>✓ Our team reviews your KYC documents (1-3 business days)</li>
              <li>✓ You&apos;ll receive an email notification upon approval</li>
              <li>✓ Once approved, you can start uploading recipes</li>
            </ul>
          </div>

          {/* Info */}
          <div className="mb-6 text-left bg-[#f3f4f6] rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium">Typical Timeline:</p>
            <p className="text-sm text-gray-600 mt-1">Most verifications are completed within 24-48 hours during business days.</p>
          </div>

          {/* Button */}
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 px-6 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-all"
          >
            Go to Login
          </button>

          {/* Support */}
          <p className="text-sm text-gray-600 mt-4">
            Questions? Contact our support team at <span className="text-[#0d9488] font-medium">support@recipechain.com</span>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            We&apos;ll send you a confirmation email once your profile is approved.
          </p>
        </div>
      </div>
    </div>
  );
}
