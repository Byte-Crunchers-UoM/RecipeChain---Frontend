"use client";

import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import { useState } from 'react';

export default function SellerDashboard() {
  const { logout } = useWeb3Auth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-[#e5e7eb] p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0d9488] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">RC</span>
            </div>
            <h1 className="text-lg font-bold text-[#0d9488]">RecipeChain</h1>
          </div>

          <nav className="space-y-2 mb-8">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f3f4f6] transition-all">
              <span className="text-xl">🏠</span>
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f3f4f6] transition-all">
              <span className="text-xl">🛒</span>
              <span>Marketplace</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f3f4f6] transition-all">
              <span className="text-xl">🔥</span>
              <span>Trending</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#d1fae5] text-[#0d9488] transition-all font-medium">
              <span className="text-xl">👨‍🍳</span>
              <span>Chefs</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f3f4f6] transition-all">
              <span className="text-xl">⚙️</span>
              <span>Settings</span>
            </a>
          </nav>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#111827]">Chef Profile</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search for chef"
                className="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
              />
              <button className="relative p-2 hover:bg-[#f3f4f6] rounded-lg transition-all">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 hover:bg-[#f3f4f6] rounded-lg transition-all">
                <span className="text-xl">🛒</span>
                <span className="absolute top-0 right-0 w-5 h-5 bg-[#0d9488] text-white text-xs flex items-center justify-center rounded-full">3</span>
              </button>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8 mb-8">
            <div className="flex gap-8">
              {/* Left Side - Avatar and Basic Info */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] rounded-full flex items-center justify-center mb-4">
                  <span className="text-6xl">👨‍🍳</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
                  Chef Isabella Rossi
                  <span className="text-[#0d9488]">✓</span>
                </h2>
                <div className="flex items-center gap-1 text-gray-600 mb-6">
                  <span>📍</span>
                  <span>Florence, Italy</span>
                </div>

                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`w-48 py-3 rounded-lg font-semibold transition-all mb-2 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-[#0d9488] text-white hover:bg-[#0f766e]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                <button className="w-48 py-3 border-2 border-[#0d9488] text-[#0d9488] rounded-lg font-semibold hover:bg-[#d1fae5] transition-all">
                  💬 Message
                </button>

                {/* Stats */}
                <div className="mt-8 w-48 space-y-4 border-t border-[#e5e7eb] pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>👥</span>
                      <span>Followers</span>
                    </div>
                    <span className="font-bold text-[#111827]">12.8K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📖</span>
                      <span>Recipes</span>
                    </div>
                    <span className="font-bold text-[#111827]">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>⭐</span>
                      <span>Rating</span>
                    </div>
                    <span className="font-bold text-[#111827]">4.9/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📅</span>
                      <span>Member Since</span>
                    </div>
                    <span className="font-bold text-[#111827] text-sm">Jan 2023</span>
                  </div>
                </div>

                {/* Connect */}
                <div className="mt-6 w-48 border-t border-[#e5e7eb] pt-6">
                  <p className="text-sm text-gray-600 mb-4">Connect</p>
                  <div className="flex items-center justify-center gap-4">
                    <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-[#f3f4f6] rounded-lg transition-all">
                      📷
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-[#f3f4f6] rounded-lg transition-all">
                      🐦
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-[#f3f4f6] rounded-lg transition-all">
                      👍
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-[#f3f4f6] rounded-lg transition-all">
                      ▶️
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Side - About and Specialities */}
              <div className="flex-1">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#111827] mb-4">About Me</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Passionate Italian chef with over 15 years of culinary experience. I specialize in traditional Italian cuisine with a modern twist, focusing on fresh, seasonal ingredients and authentic flavors. My journey began in my grandmother&apos;s kitchen in Tuscany, where I learned the art of pasta-making and the importance of quality ingredients. Now, I&apos;m dedicated to sharing my love for Italian cooking with food enthusiasts around the world.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#111827] mb-4">Specialities</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Italian Cuisine', 'Pasta & Risotto', 'Mediterranean', 'Vegetarian', 'Desserts'].map((specialty) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 bg-[#d1fae5] text-[#0d9488] rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Cookbook */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-6">My Cookbook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg overflow-hidden border border-[#e5e7eb] hover:shadow-md transition-all">
                  <div className="h-40 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] flex items-center justify-center relative">
                    <span className="text-6xl">🍰</span>
                    <button className="absolute top-3 right-3 p-2 hover:bg-white/50 rounded-lg transition-all">
                      <span className="text-xl">⋮</span>
                    </button>
                    <button className="absolute bottom-3 right-3 p-2 bg-white rounded-lg hover:bg-gray-100 transition-all">
                      <span className="text-xl text-[#0d9488]">❤️</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-[#111827] mb-2">Tiramisu Dessert</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>⏱️</span>
                        <span>3 hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                        <span className="text-gray-600 text-xs">(425)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
