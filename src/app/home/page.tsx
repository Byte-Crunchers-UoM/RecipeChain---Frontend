"use client";

import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import { useState } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { logout } = useWeb3Auth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const recipes = [
    { id: 1, name: 'Pasta Carbonara', chef: 'Chef Marco', rating: 4.9, likes: 234, time: '30 min', cuisine: 'Italian' },
    { id: 2, name: 'Sushi Roll', chef: 'Chef Yuki', rating: 4.8, likes: 456, time: '45 min', cuisine: 'Asian' },
    { id: 3, name: 'Coq au Vin', chef: 'Chef Pierre', rating: 4.7, likes: 189, time: '2 hours', cuisine: 'French' },
    { id: 4, name: 'Tacos Al Pastor', chef: 'Chef Rosa', rating: 4.9, likes: 312, time: '35 min', cuisine: 'Mexican' },
    { id: 5, name: 'Butter Chicken', chef: 'Chef Priya', rating: 4.8, likes: 567, time: '1 hour', cuisine: 'Indian' },
    { id: 6, name: 'Greek Salad', chef: 'Chef Sofia', rating: 4.6, likes: 145, time: '15 min', cuisine: 'Mediterranean' },
  ];

  const chefs = [
    { id: 1, name: 'Chef Isabella Rossi', specialty: 'Italian Cuisine', followers: '12.8K', rating: 4.9 },
    { id: 2, name: 'Chef Marco Rossi', specialty: 'Italian & Mediterranean', followers: '9.5K', rating: 4.8 },
    { id: 3, name: 'Chef Yuki Tanaka', specialty: 'Japanese & Asian', followers: '8.3K', rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0d9488] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <h1 className="text-lg font-bold text-[#0d9488]">RecipeChain</h1>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:text-[#0d9488] transition-all">
              <span className="text-2xl">🔔</span>
            </button>
            <button className="text-gray-600 hover:text-[#0d9488] transition-all">
              <span className="text-2xl">❤️</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#d1fae5] to-[#a7f3d0] py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#047857] mb-4">Discover Amazing Recipes</h2>
          <p className="text-[#059669] text-lg">
            Explore culinary masterpieces from chefs around the world
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Featured Chefs */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-[#111827] mb-6">Featured Chefs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chefs.map(chef => (
              <div key={chef.id} className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] rounded-full flex items-center justify-center">
                    <span className="text-3xl">👨‍🍳</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827]">{chef.name}</h4>
                    <p className="text-sm text-gray-600">{chef.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600">👥 {chef.followers}</span>
                  <span className="text-yellow-400">⭐ {chef.rating}</span>
                </div>
                <button className="w-full py-2 border-2 border-[#0d9488] text-[#0d9488] rounded-lg font-semibold hover:bg-[#d1fae5] transition-all">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recipes Grid */}
        <section>
          <h3 className="text-2xl font-bold text-[#111827] mb-6">Trending Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden hover:shadow-md transition-all">
                <div className="h-40 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] flex items-center justify-center relative">
                  <span className="text-6xl">🍽️</span>
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-lg hover:bg-gray-100 transition-all">
                    <span className="text-lg">❤️</span>
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-[#111827] mb-2">{recipe.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{recipe.chef}</p>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600">⏱️ {recipe.time}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐ {recipe.rating}</span>
                      <span className="text-gray-600 text-xs">({recipe.likes})</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-[#0d9488] text-white rounded-lg font-medium text-sm hover:bg-[#0f766e] transition-all">
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
