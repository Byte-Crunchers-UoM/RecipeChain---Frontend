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
  unlocks: number;
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
    unlocks: 45,
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
    unlocks: 0,
    rating: 0,
    updatedAt: '1 year ago',
  },
  {
    id: '3',
    name: 'Sous Vide Salmon',
    image: '/recipes/salmon.jpg',
    category: 'Seafood',
    price: 8.99,
    status: 'Deactivate',
    views: 3200,
    unlocks: 120,
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
    unlocks: 45,
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
    case 'Deactivate':
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
              <option>Deactivate</option>
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

        {/* Recipe Table */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafb] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Recipe</th>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Price</th>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Status</th>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Performance</th>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRecipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-lg flex-shrink-0" />
                        <div>
                          <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.name}</p>
                          <p className="text-[12px] text-[#64748b] font-roboto">{recipe.views} views</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.price} XRP</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-medium ${getStatusColor(recipe.status)}`}>
                        {recipe.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-[12px] font-bold text-[#1a2632]">{recipe.views}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-[12px] font-bold text-[#1a2632]">{recipe.unlocks}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Updated {recipe.updatedAt}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#64748b] hover:text-[#1a2632] text-lg">⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
