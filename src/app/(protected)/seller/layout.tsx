"use client";

import { useWeb3Auth } from '@/lib/web3/Web3AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: '�‍🍳' },
  { name: 'Recipes', href: '/seller/recipes', icon: '📖' },
  { name: 'Orders', href: '/seller/orders', icon: '📦' },
  { name: 'Reviews', href: '/seller/reviews', icon: '⭐' },
  { name: 'Earnings', href: '/seller/earnings', icon: '💰' },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useWeb3Auth();
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 bg-white">
          <div className="flex items-center gap-3">
            <img src="/images/recipechain_logo_green.png" alt="RecipeChain" className="h-10 w-auto" />
            <span className="text-teal-700 font-bold text-lg">RecipeChain</span>
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
                    ? 'bg-teal-100 text-teal-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Account & Settings */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-700 hover:bg-gray-100 transition-all"
          >
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Chef Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-900 font-medium">Chef</p>
                <p className="text-xs text-gray-500">{user?.email || user?.walletAddress?.slice(0, 10) + '...' || 'undefined...'}</p>
              </div>
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'C'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
