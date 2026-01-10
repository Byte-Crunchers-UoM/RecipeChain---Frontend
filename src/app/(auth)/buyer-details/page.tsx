"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BuyerDetailsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    dietary: [] as string[],
    cuisinePreferences: [] as string[],
    allergies: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: 'dietary' | 'cuisinePreferences', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save buyer data
    localStorage.setItem('park_chain_role', 'buyer');
    localStorage.setItem('park_chain_buyer_data', JSON.stringify(formData));
    localStorage.setItem('park_chain_auth', 'buyer_' + Date.now());
    
    // Redirect to home
    setTimeout(() => {
      router.push('/home');
    }, 1000);
  };

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];
  const cuisineOptions = ['Italian', 'Asian', 'French', 'Mexican', 'Indian', 'Mediterranean'];

  return (
    <div className="min-h-screen bg-[#f8fafb] py-12">
      <div className="w-full max-w-2xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Complete Your Profile</h1>
          <p className="text-[#4b5563]">Help us personalize your RecipeChain experience</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-[#e5e7eb] pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Basic Information</h2>
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
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="18"
                      className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      placeholder="Your age"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="border-b border-[#e5e7eb] pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Dietary Preferences</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center p-3 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-all">
                    <input
                      type="checkbox"
                      checked={formData.dietary.includes(option)}
                      onChange={() => handleCheckboxChange('dietary', option)}
                      className="w-4 h-4 text-[#0d9488] rounded focus:ring-2 focus:ring-[#0d9488]"
                    />
                    <span className="ml-2 text-sm font-medium text-[#111827]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div className="border-b border-[#e5e7eb] pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Cuisine Preferences</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisineOptions.map(option => (
                  <label key={option} className="flex items-center p-3 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-all">
                    <input
                      type="checkbox"
                      checked={formData.cuisinePreferences.includes(option)}
                      onChange={() => handleCheckboxChange('cuisinePreferences', option)}
                      className="w-4 h-4 text-[#0d9488] rounded focus:ring-2 focus:ring-[#0d9488]"
                    />
                    <span className="ml-2 text-sm font-medium text-[#111827]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="pb-6">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Allergies & Restrictions</h2>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                List any food allergies or restrictions
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                placeholder="E.g., Peanut allergy, Dairy intolerant..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up your profile...' : 'Get Started'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-[#d1fae5] border border-[#a7f3d0] rounded-lg">
          <p className="text-sm text-[#047857]">
            ✓ Your preferences help us recommend recipes you&apos;ll love. You can update these anytime in your settings.
          </p>
        </div>
      </div>
    </div>
  );
}
