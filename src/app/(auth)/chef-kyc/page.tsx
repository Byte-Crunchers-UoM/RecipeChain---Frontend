"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChefKYCPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    cuisine: '',
    experience: '',
    certifications: '',
    idType: '',
    idNumber: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save KYC data and mark as pending approval
    localStorage.setItem('park_chain_role', 'chef');
    localStorage.setItem('park_chain_kyc_pending', 'true');
    localStorage.setItem('park_chain_kyc_data', JSON.stringify(formData));
    
    // Redirect to approval pending page
    setTimeout(() => {
      router.push('/approval-pending');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] py-12">
      <div className="w-full max-w-2xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Chef Verification</h1>
          <p className="text-[#4b5563]">Complete your KYC to become a verified chef on RecipeChain</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-[#e5e7eb] pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    placeholder="Your address"
                  />
                </div>
              </div>
            </div>

            {/* Culinary Information */}
            <div className="border-b border-[#e5e7eb] pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Culinary Background</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Cuisine Specialty *
                  </label>
                  <select
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  >
                    <option value="">Select your cuisine specialty</option>
                    <option value="italian">Italian</option>
                    <option value="asian">Asian</option>
                    <option value="french">French</option>
                    <option value="mexican">Mexican</option>
                    <option value="indian">Indian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Years of Experience *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-2">0-2 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Certifications/Awards
                  </label>
                  <textarea
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    placeholder="List your certifications, awards, or achievements"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Identity Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    ID Type *
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  >
                    <option value="">Select ID type</option>
                    <option value="passport">Passport</option>
                    <option value="driving-license">Driving License</option>
                    <option value="national-id">National ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    placeholder="Your ID number"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-[#d1fae5] border border-[#a7f3d0] rounded-lg">
          <p className="text-sm text-[#047857]">
            ℹ️ Your information will be reviewed by our admin team. You&apos;ll be notified once your profile is verified.
          </p>
        </div>
      </div>
    </div>
  );
}
