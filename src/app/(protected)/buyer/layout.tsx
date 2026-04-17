"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ReactNode,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  TrendingUp,
  BookOpen,
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

type BuyerProfile = {
  user_id: string;
  email: string;
  wallet_address: string;
  joined_at: string;
  role: string;
  display_name: string;
  bio: string;
  profile_picture: string;
  total_purchases: number;
  total_spent_xrp: number;
  account_balance: number;
  saved_recipes_count: number;
  feedback_count: number;
  notification_count?: number;
  cart_count?: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getInitials(name?: string, email?: string) {
  const source = String(name || email || "U").trim();
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getDisplayName(profile: BuyerProfile | null, authUser: any) {
  const profileDisplayName = String(profile?.display_name || "").trim();
  if (profileDisplayName) return profileDisplayName;

  const profileEmail = String(profile?.email || "").trim();
  if (profileEmail) return profileEmail;

  const authEmail = String(authUser?.email || "").trim();
  if (authEmail) return authEmail;

  return "Buyer";
}

export default function BuyerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resetAll, user } = useAuth() as any;

  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editRedirectLoading, setEditRedirectLoading] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [topSearch, setTopSearch] = useState("");

  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true);

      const response = await fetch(`${API_BASE}/buyer/me/profile`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Buyer layout profile load error:", data?.message);
        setProfile(null);
        return;
      }

      setProfile(data?.profile || null);
    } catch (error) {
      console.error("Buyer layout profile load error:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const onProfileUpdated = () => {
      loadProfile();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadProfile();
      }
    };

    window.addEventListener(
      "buyer-profile-updated",
      onProfileUpdated as EventListener
    );
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener(
        "buyer-profile-updated",
        onProfileUpdated as EventListener
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadProfile]);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Home", href: "/buyer/dashboard", icon: Home },
      { label: "Market Place", href: "/marketplace", icon: LayoutGrid },
      { label: "Trending Recipes", href: "/recipes", icon: TrendingUp },
      { label: "My Cookbook", href: "/buyer/cookbook", icon: BookOpen },
      { label: "Profile", href: "/buyer/profile", icon: UserIcon },
    ],
    []
  );

  const handleLogout = async () => {
    await resetAll();
    router.replace("/login");
  };

  const displayName = getDisplayName(profile, user);
  const profileEmail =
    String(profile?.email || user?.email || "").trim() ||
    "buyer@recipechain.io";
  const avatarText = getInitials(displayName, profileEmail);
  const profileBio =
    String(profile?.bio || "").trim() || "XRPL buyer • Recipe collector";

  const notificationCount = Number(profile?.notification_count || 0);
  const cartCount = Number(profile?.cart_count || 0);

  const runTopSearch = () => {
    const q = topSearch.trim();
    router.push(
      q ? `/buyer/cookbook?q=${encodeURIComponent(q)}` : "/buyer/cookbook"
    );
  };

  const isCookbookPage = pathname === "/buyer/cookbook";
  const isProfilePage = pathname === "/buyer/profile";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-[240px] flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
          <Image src="/Logo.png" alt="RecipeChain" width={34} height={34} />
          <div className="font-semibold text-gray-900">RecipeChain</div>
        </div>

        <nav className="space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (pathname === "/buyer/cookbook" &&
                item.href.startsWith("/buyer/cookbook"));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "relative flex items-center gap-4 rounded-2xl px-4 py-3 text-[16px] transition",
                  active
                    ? "bg-teal-50 font-semibold text-teal-700"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-2 rounded-r-xl bg-teal-700" />
                )}

                <Icon
                  size={22}
                  className={active ? "text-teal-700" : "text-slate-500"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5">
          {isCookbookPage ? (
            <div className="max-w-2xl flex-1">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                <input
                  value={topSearch}
                  onChange={(e) => setTopSearch(e.target.value)}
                  placeholder="Search your cookbook"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runTopSearch();
                  }}
                />

                <button
                  onClick={runTopSearch}
                  className="rounded-lg p-1 transition hover:bg-white"
                  aria-label="Search"
                >
                  <Search size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-900">
                {isProfilePage ? "My Profile" : ""}
              </div>
              <div className="text-xs text-gray-500">
                {isProfilePage ? "Manage your account, wallet, and activity" : ""}
              </div>
            </div>
          )}

          <div className="relative ml-5 flex items-center gap-3">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((s) => !s);
                  setCartOpen(false);
                  setProfileOpen(false);
                }}
                className="relative rounded-xl p-2 transition hover:bg-gray-50"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-slate-600" />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b px-4 py-3 text-sm font-medium text-gray-900">
                    Notifications
                  </div>
                  <div className="px-4 py-5 text-sm text-gray-500">
                    Notifications are not connected yet.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setCartOpen(true);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              className="relative rounded-xl p-2 transition hover:bg-gray-50"
              aria-label="Cart"
            >
              <ShoppingCart size={20} className="text-slate-600" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((s) => !s);
                  setNotifOpen(false);
                  setCartOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-teal-600 font-semibold text-white"
                aria-label="Profile"
              >
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="flex gap-3 p-4">
                    {profile?.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 font-semibold text-white">
                        {avatarText}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="truncate font-semibold text-gray-900">
                        {profileLoading ? "Loading..." : displayName}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {profileLoading ? "Loading..." : profileEmail}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {profileLoading ? "Loading..." : profileBio}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      onClick={() => {
                        setEditRedirectLoading(true);
                        setProfileOpen(false);
                        router.push("/buyer/profile?edit=1");
                      }}
                      className="w-full rounded-xl bg-teal-600 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
                    >
                      {editRedirectLoading ? "Opening..." : "Edit Profile"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-5">{children}</main>
      </div>

      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="font-semibold text-gray-900">Your Cart</div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg px-2 py-1 hover:bg-gray-100"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className="p-5 text-sm text-gray-500">
              Cart is not connected yet.
            </div>

            <div className="border-t p-5">
              <button
                onClick={() => setCartOpen(false)}
                className="w-full rounded-xl bg-teal-600 py-3 text-sm font-medium text-white transition hover:bg-teal-700"
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