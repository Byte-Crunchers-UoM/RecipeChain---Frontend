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
      localStorage.removeItem('park_chain_role');
      document.cookie = 'park_chain_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">
              Welcome back, Seller! 👋
            </h2>
            <p className="text-gray-600">
              Here&apos;s an overview of your parking slot business
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={disconnectLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disconnectLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
              +12%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Earnings</h3>
          <p className="text-2xl font-bold text-[#111827]">125.5 XRP</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              +5
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Active Bookings</h3>
          <p className="text-2xl font-bold text-[#111827]">12</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🅿️</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Available Spots</h3>
          <p className="text-2xl font-bold text-[#111827]">3</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Average Rating</h3>
          <p className="text-2xl font-bold text-[#111827]">4.8</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-[#F2F2F2] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#111827] rounded-lg flex items-center justify-center text-white font-bold">
                    D{i}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Booking #{1000 + i}</p>
                    <p className="text-xs text-gray-500">Slot A-{i} • 2 hours</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  +{5 + i}.2 XRP
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[#111827] font-medium hover:bg-[#F2F2F2] rounded-lg transition-all">
            View All Bookings
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D8D8]">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 bg-[#F2F2F2] rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#111827]">Booking Request #{2000 + i}</p>
                  <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Slot B-{i} • Today, 2:00 PM - 4:00 PM
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-[#111827] text-white text-xs font-medium rounded-lg hover:bg-[#1f2937] transition-all">
                    Approve
                  </button>
                  <button className="flex-1 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-gradient-to-r from-[#111827] to-[#1f2937] rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-300 mb-1">Connected Wallet</h3>
            <p className="text-lg font-mono font-semibold">
              {userInfo?.email || 'Not connected'}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm text-gray-300 mb-1">Network</h3>
            <p className="text-lg font-semibold">XRPL Testnet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
