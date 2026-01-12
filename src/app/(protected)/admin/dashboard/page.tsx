"use client";

import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'User Management', href: '/admin/users', icon: '👥' },
  { name: 'Seller Verification', href: '/admin/verification', icon: '✓' },
  { name: 'Feedback', href: '/admin/feedback', icon: '💬' },
  { name: 'Account & Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminDashboard() {
  const { user, logout, isLoading } = useWeb3Auth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authorized
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="animate-spin h-8 w-8 border-4 border-[#111827] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#A0A0A0] shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 bg-[#8C8C8C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#111827]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span className="text-[#111827] font-bold text-lg">Park Chain</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#D8D8D8] text-[#111827] font-semibold shadow-md'
                    : 'text-[#111827] hover:bg-[#8C8C8C]'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-[#111827] hover:bg-[#8C8C8C] transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-[#D8D8D8]">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#111827]">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-[#111827] font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
              </div>
              <div className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#D8D8D8]">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-[#111827]">0</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#D8D8D8]">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Verifications</h3>
              <p className="text-3xl font-bold text-[#111827]">0</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#D8D8D8]">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Feedback</h3>
              <p className="text-3xl font-bold text-[#111827]">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
