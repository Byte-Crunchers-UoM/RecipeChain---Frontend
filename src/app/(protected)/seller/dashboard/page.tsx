"use client";

import { useRouter } from 'next/navigation';
import { useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";

export default function SellerDashboard() {
  const { disconnect, loading: disconnectLoading } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await disconnect();
      // Clear localStorage and cookies
      localStorage.removeItem('recipe_chain_role');
      document.cookie = 'recipe_chain_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Chef Profile Card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-center">
            {/* Profile Picture */}
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 border-4 border-gray-100"></div>
            
            {/* Chef Name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Chef Isabella Rossi ✓
            </h2>
            <p className="text-gray-600 text-sm flex items-center justify-center gap-1 mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Florence, Italy
            </p>

            {/* Follow Button */}
            <button className="w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-all mb-3">
              Follow
            </button>

            {/* Message Button */}
            <button className="w-full border-2 border-teal-600 text-teal-600 font-semibold py-2 rounded-lg hover:bg-teal-50 transition-all mb-6">
              Message
            </button>

            {/* Stats */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 10a3 3 0 11-6 0 3 3 0 016 0zM12.75 12a.75.75 0 110-1.5.75.75 0 010 1.5zM12.75 16a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
                </svg>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-gray-900">12.8K</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                </svg>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-gray-900">89</p>
                  <p className="text-sm text-gray-600">Recipes</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-gray-900">4.9/5</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="text-lg font-bold text-gray-900">January 2023</p>
                </div>
              </div>
            </div>

            {/* Connect Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-gray-600 text-sm mb-4">Connect</p>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-gray-400 hover:text-teal-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9-5 9-5z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={disconnectLoading}
            className="w-full mt-6 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {disconnectLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Right Column - Chef Info & Cookbook */}
      <div className="lg:col-span-2 space-y-8">
        {/* About Me Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-600 leading-relaxed">
            Passionate Italian chef with over 15 years of culinary experience. I specialize in traditional Italian cuisine with a modern twist, focusing on fresh, seasonal ingredients and authentic flavors. My journey began in my grandmother's kitchen in Tuscany, where I learned the art of pasta-making and the importance of quality ingredients. Now, I&apos;m dedicated to sharing my love for Italian cooking with food enthusiasts around the world.
          </p>
        </div>

        {/* Specialities Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Specialities</h3>
          <div className="flex flex-wrap gap-2">
            {['Italian Cuisine', 'Pasta & Risotto', 'Mediterranean', 'Vegetarian', 'Desserts'].map((spec) => (
              <span key={spec} className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* My Cookbook Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">My Cookbook</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                {/* Recipe Image Placeholder */}
                <div className="h-40 bg-gray-200"></div>
                
                {/* Recipe Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Tiramisu Dessert</h4>
                    <button className="text-teal-600 hover:text-teal-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Rating & Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="font-semibold text-gray-900">(425)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                      </svg>
                      3 hours
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
