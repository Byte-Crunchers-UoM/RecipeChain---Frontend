'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AddRecipePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    servings: '',
    cookTime: '',
    ingredients: '',
    instructions: '',
    category: '',
    isPublic: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your submission logic here
  };

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-8 py-6 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-[#0d9488] hover:text-[#0d9488] opacity-80 text-[12px] font-roboto mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#1a2632] font-roboto">Add New Recipe</h1>
            <p className="text-[12px] text-[#64748b] font-roboto mt-1">Create a blockchain-verified recipe and start earning XRP</p>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-8">
            <h2 className="text-2xl font-bold text-[#1a2632] mb-6 font-roboto">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Recipe Name */}
              <div>
                <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Mastorani Noodles"
                  required
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your recipe in detail..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                  >
                    <option value="">Select a category</option>
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="side">Side Dish</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                    Price (XRP) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 4.99"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                  />
                </div>
              </div>

              {/* Cook Time & Servings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                    Cook Time (minutes) *
                  </label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    required
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                    Servings *
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    placeholder="e.g., 4"
                    required
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients & Instructions */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-8">
            <h2 className="text-2xl font-bold text-[#1a2632] mb-6 font-roboto">Recipe Details</h2>
            
            <div className="space-y-6">
              {/* Ingredients */}
              <div>
                <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                  Ingredients (one per line) *
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-[14px] font-bold text-[#1a2632] mb-2 font-roboto">
                  Instructions (step by step) *
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="1. Preheat oven to 350°F&#10;2. Mix ingredients...&#10;3. Bake for..."
                  required
                  rows={8}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-8">
            <h2 className="text-2xl font-bold text-[#1a2632] mb-6 font-roboto">Settings</h2>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-5 h-5 accent-[#0d9488] cursor-pointer"
              />
              <label className="text-[14px] text-[#1a2632] font-roboto cursor-pointer">
                Make this recipe public (visible to all users)
              </label>
            </div>
            <p className="text-[12px] text-[#64748b] font-roboto mt-3">
              Public recipes can be discovered and purchased by other users on the platform.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/dashboard">
              <button
                type="button"
                className="px-8 py-3 rounded-lg border border-[#e5e7eb] text-[14px] font-bold text-[#1a2632] hover:bg-[#f8fafb] font-roboto transition"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-[#0d9488] text-white text-[14px] font-bold hover:opacity-90 font-roboto transition"
            >
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
