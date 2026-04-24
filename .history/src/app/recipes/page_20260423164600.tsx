'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  status: 'Active' | 'Draft' | 'Deactivate';
  views: number;
  wishlist: number;
  rating: number;
  updatedAt: string;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Truffle Mushroom Risotto',
    image: '/recipes/truffle.jpg',
    category: 'Italian',
    price: 5.99,
    status: 'Active',
    views: 1240,
    wishlist: 45,
    rating: 4.9,
    updatedAt: '2 days ago',
  },
  {
    id: '2',
    name: 'Vegan Buddha Bowl',
    image: '/recipes/buddha.jpg',
    category: 'Vegan',
    price: 3.99,
    status: 'Draft',
    views: 0,
    wishlist: 0,
    rating: 0,
    updatedAt: '1 year ago',
  },
  {
    id: '3',
    name: 'Sous Vide Salmon',
    image: '/recipes/salmon.jpg',
    category: 'Seafood',
    price: 8.99,
    status: 'Discontinued',
    views: 3200,
    wishlist: 120,
    rating: 4.8,
    updatedAt: '1 month ago',
  },
  {
    id: '4',
    name: 'Matcha Lava Cake',
    image: '/recipes/matcha.jpg',
    category: 'Dessert',
    price: 4.99,
    status: 'Active',
    views: 890,
    wishlist: 45,
    rating: 4.7,
    updatedAt: '3 days ago',
  },
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Italian: 'bg-blue-100 text-blue-700',
    Vegan: 'bg-green-100 text-green-700',
    Seafood: 'bg-cyan-100 text-cyan-700',
    Dessert: 'bg-pink-100 text-pink-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-[#0d9488] text-white';
    case 'Draft':
      return 'bg-yellow-500 text-white';
    case 'Discontinued':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1a2632] font-roboto">My Recipes</h1>
            <p className="text-[12px] text-[#64748b] font-roboto mt-1">Manage all your published and draft recipes</p>
          </div>
          <Link href="/recipes/add">
            <button className="bg-[#0d9488] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium text-[14px] font-roboto transition flex items-center gap-2">
              <span>+</span> Add New Recipe
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Filter recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-[#e5e7eb] rounded-lg text-[12px] text-[#1a2632] font-roboto focus:outline-none focus:border-[#0d9488]"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Discontinued</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-[#e5e7eb] rounded-lg text-[12px] text-[#1a2632] font-roboto focus:outline-none focus:border-[#0d9488]"
            >
              <option>All Categories</option>
              <option>Italian</option>
              <option>Vegan</option>
              <option>Seafood</option>
              <option>Dessert</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-[#e5e7eb] rounded-lg text-[12px] text-[#1a2632] font-roboto focus:outline-none focus:border-[#0d9488]"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        {/* Recipe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden hover:shadow-lg transition">
              {/* Recipe Image */}
              <div className="relative h-48 bg-gray-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20" />
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[12px] font-bold ${getStatusColor(recipe.status)}`}>
                  {recipe.status}
                </span>
              </div>

              {/* Recipe Info */}
              <div className="p-4">
                <h3 className="text-[14px] font-bold text-[#1a2632] font-roboto mb-2">{recipe.name}</h3>
                
                {/* Category Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded text-[11px] font-medium ${getCategoryColor(recipe.category)}`}>
                    {recipe.category}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <p className="text-[14px] font-bold text-[#1a2632] font-roboto">
                    {recipe.price} XRP
                    <span className="text-[12px] text-[#64748b] font-roboto ml-1">({(recipe.price * 2.5).toFixed(2)} ETH)</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[12px] text-[#64748b] font-roboto mb-4 border-t border-[#e5e7eb] pt-3">
                  <span>👁 {recipe.views} views</span>
                  <span>❤ {recipe.wishlist} wishlists</span>
                  <span>⭐ {recipe.rating}</span>
                </div>

                {/* Updated At */}
                <p className="text-[11px] text-[#64748b] font-roboto mb-4">Updated {recipe.updatedAt}</p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {recipe.status === 'Draft' ? (
                    <button className="flex-1 px-3 py-2 bg-[#0d9488] text-white rounded text-[12px] font-medium hover:opacity-90 transition">
                      Publish
                    </button>
                  ) : (
                    <button className="flex-1 px-3 py-2 border border-[#0d9488] text-[#0d9488] rounded text-[12px] font-medium hover:bg-[#e0f2f1] transition">
                      View
                    </button>
                  )}
                  <button className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-[12px] font-medium hover:opacity-90 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
