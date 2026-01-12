"use client";

import { useWeb3Auth } from '@/lib/web3/Web3AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/buyer/dashboard', icon: '📊' },
  { name: 'Browse Recipes', href: '/buyer/recipes', icon: '📖' },
  { name: 'My Orders', href: '/buyer/orders', icon: '📦' },
  { name: 'Favorites', href: '/buyer/favorites', icon: '❤️' },
  { name: 'Reviews', href: '/buyer/reviews', icon: '⭐' },
];

export default function BuyerLayout({
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
        <nav className="flex-1 px-4 py-6 space-y-2">
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

        {/* User Profile */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user?.name || 'Buyer'}</p>
              <p className="text-xs text-gray-500">{user?.email || user?.walletAddress?.slice(0, 10) + '...'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
