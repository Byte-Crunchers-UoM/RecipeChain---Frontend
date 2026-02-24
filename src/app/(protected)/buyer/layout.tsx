"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  TrendingUp,
  BookOpen,
  Heart,
  User as UserIcon,
  LogOut,
  Bell,
  ShoppingCart,
  Search,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type NavItem = {
  label: string;
  href: string;
  icon: any;
};

export default function BuyerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resetAll, user } = useAuth() as any;

  // popups
  const [notifOpen, setNotifOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // topbar search
  const [topSearch, setTopSearch] = useState("");

  // outside click refs
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (notifOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen, profileOpen]);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Home", href: "/buyer/dashboard", icon: Home },
      { label: "Market Place", href: "/marketplace", icon: LayoutGrid },
      { label: "Trending Recipes", href: "/recipes", icon: TrendingUp },
      { label: "My Cookbook", href: "/buyer/cookbook", icon: BookOpen },
      { label: "Favorites", href: "/buyer/cookbook?tab=favorites", icon: Heart },
      { label: "Profile", href: "/buyer/profile", icon: UserIcon },
    ],
    []
  );

  const handleLogout = async () => {
    await resetAll();
    router.replace("/login");
  };

  // Dummy data (replace with backend later)
  const notifications = [
    { id: "n1", title: "New recipe approved", time: "2m ago" },
    { id: "n2", title: "Order update", time: "1h ago" },
  ];

  const cartItems = [
    { id: "c1", name: "Creamy Garlic Pasta", price: 12 },
    { id: "c2", name: "Fluffy Blueberry Pancakes", price: 8 },
  ];

  const displayName = user?.name || "John Doe";
  const avatarText = (displayName?.[0] || "U").toUpperCase();

  // highlight only My Cookbook in cookbook page
  const isCookbookPage = pathname === "/buyer/cookbook";

  const runTopSearch = () => {
    // ✅ You can wire this to global search later.
    // For now, just route to cookbook with query param:
    const q = topSearch.trim();
    router.push(q ? `/buyer/cookbook?q=${encodeURIComponent(q)}` : "/buyer/cookbook");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col">
        {/* Brand */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-200">
          <Image src="/Logo.png" alt="RecipeChain" width={34} height={34} />
          <div className="font-semibold text-gray-900">RecipeChain</div>
        </div>

        {/* Nav */}
        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "My Cookbook" && isCookbookPage;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "relative flex items-center gap-4 px-4 py-3 rounded-2xl text-[16px] transition",
                  active ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-2 rounded-r-xl bg-teal-700" />
                )}
                <Icon size={22} className={active ? "text-teal-700" : "text-slate-500"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5">
          {/* Search bar with RIGHT icon clickable */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50">
              <input
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                placeholder="Search your cookbook"
                className="w-full bg-transparent outline-none text-sm text-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") runTopSearch();
                }}
              />

              <button
                onClick={runTopSearch}
                className="p-1 rounded-lg hover:bg-white transition"
                aria-label="Search"
              >
                <Search size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 ml-5 relative">
            {/* Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((s) => !s);
                  setCartOpen(false);
                  setProfileOpen(false);
                }}
                className="relative rounded-xl p-2 hover:bg-gray-50 transition"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-slate-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>

              {notifOpen && (
                <div className="absolute top-12 right-0 w-72 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b text-sm font-medium text-gray-900">
                    Notifications
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="text-sm text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => {
                setCartOpen(true);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              className="relative rounded-xl p-2 hover:bg-gray-50 transition"
              aria-label="Cart"
            >
              <ShoppingCart size={20} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((s) => !s);
                  setNotifOpen(false);
                  setCartOpen(false);
                }}
                className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold"
                aria-label="Profile"
              >
                {avatarText}
              </button>

              {profileOpen && (
                <div className="absolute top-12 right-0 w-72 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50">
                  <div className="p-4 flex gap-3">
                    <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold">
                      {avatarText}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {user?.name || "John Doe"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email || "buyer@recipechain.io"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {user?.bio || "Food lover • Recipe collector"}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/buyer/profile");
                      }}
                      className="w-full rounded-xl py-2 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition"
                    >
                      Show Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-5">{children}</main>
      </div>

      {/* Cart Modal */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4"
          onClick={() => setCartOpen(false)} // ✅ click outside close
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-gray-900">Your Cart</div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg px-2 py-1 hover:bg-gray-100"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-auto">
              {cartItems.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200"
                >
                  <div className="text-sm text-gray-900">{it.name}</div>
                  <div className="text-sm font-medium">${it.price}</div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t">
              <button
                onClick={() => setCartOpen(false)}
                className="w-full rounded-xl py-3 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}