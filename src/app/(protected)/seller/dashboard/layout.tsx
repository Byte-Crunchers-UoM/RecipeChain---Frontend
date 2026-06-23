"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWeb3AuthDisconnect } from "@web3auth/modal/react";

const navItems = [
  { name: "Dashboard", href: "/seller/dashboard", icon: "📊" },
  { name: "My Recipes", href: "/seller/recipes", icon: "🧾" },
  { name: "Profile", href: "/seller/profile", icon: "👤" },
  { name: "Settings", href: "/seller/settings", icon: "⚙️" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isAuthenticated, isLoading, logout } = useAuth();
  const { disconnect } = useWeb3AuthDisconnect();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!role) {
      router.replace("/select-role");
      return;
    }

    if (role !== "seller") {
      router.replace("/buyer/dashboard");
    }
  }, [isLoading, isAuthenticated, role, router]);

  const handleLogout = async () => {
    logout(); // clears ONLY auth cookie
    try {
      await disconnect();
    } catch {}
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            <Image src="/Logo.png" alt="RecipeChain" width={36} height={36} />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-gray-900">RecipeChain</p>
            <p className="text-xs text-gray-500">Seller Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-teal-50 text-teal-800 border border-teal-100"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <span className="text-lg">⎋</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="w-full relative">
              <input
                placeholder="Search your recipes"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-200"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">⌕</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
