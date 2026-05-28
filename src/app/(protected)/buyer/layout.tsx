"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ReactNode,
  Suspense,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  X,
  ChevronRight,
  History,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
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

type SearchSuggestion = {
  recipe_id: string;
  title: string;
  difficulty_level: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const RECENT_SEARCHES_KEY = "buyer-cookbook-recent-searches";
const MAX_RECENT_SEARCHES = 5;

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

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string" && item.trim())
      : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(values: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(values));
  } catch {}
}

function BuyerLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetAll, user } = useAuth() as any;

  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [notifOpen, setNotifOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [topSearch, setTopSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>(
    []
  );
  const [popularSuggestions, setPopularSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const isCookbookPage = pathname === "/buyer/cookbook";
  const isProfilePage = pathname === "/buyer/profile";
  const qParam = searchParams.get("q") || "";

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
        setProfile(null);
        return;
      }

      setProfile(data?.profile || null);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    setRecentSearches(readRecentSearches());
  }, [loadProfile]);

  useEffect(() => {
    if (isCookbookPage) {
      setTopSearch(qParam);
    } else {
      setTopSearch("");
      setSearchSuggestions([]);
      setSearchFocused(false);
    }
  }, [isCookbookPage, qParam]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [topSearch, searchSuggestions, recentSearches, popularSuggestions]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (notifOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }

      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen, profileOpen]);

  useEffect(() => {
    const onProfileUpdated = () => loadProfile();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadProfile();
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

  useEffect(() => {
    if (!isCookbookPage) return;

    const loadPopular = async () => {
      try {
        const response = await fetch(`${API_BASE}/buyer/me/cookbook`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setPopularSuggestions([]);
          return;
        }

        const items = Array.isArray(data?.items) ? data.items : [];
        const popular = [...items]
          .sort((a, b) => Number(b.rating_avg || 0) - Number(a.rating_avg || 0))
          .slice(0, 5)
          .map((item: any) => ({
            recipe_id: item.recipe_id,
            title: item.title,
            difficulty_level: item.difficulty_level || null,
          }));

        setPopularSuggestions(popular);
      } catch {
        setPopularSuggestions([]);
      }
    };

    void loadPopular();
  }, [isCookbookPage]);

  useEffect(() => {
    if (!isCookbookPage) return;

    const term = topSearch.trim();

    if (!term) {
      setSearchSuggestions([]);
      setSearchLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = await fetch(
          `${API_BASE}/buyer/me/cookbook?q=${encodeURIComponent(term)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setSearchSuggestions([]);
          return;
        }

        const items = Array.isArray(data?.items) ? data.items : [];
        const suggestions = items.slice(0, 6).map((item: any) => ({
          recipe_id: item.recipe_id,
          title: item.title,
          difficulty_level: item.difficulty_level || null,
        }));

        setSearchSuggestions(suggestions);
      } catch {
        setSearchSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [topSearch, isCookbookPage]);

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
    String(profile?.email || user?.email || "").trim() || "buyer@recipechain.io";
  const avatarText = getInitials(displayName, profileEmail);
  const profileBio =
    String(profile?.bio || "").trim() || "XRPL buyer • Recipe collector";

  const notificationCount = Number(profile?.notification_count || 0);
  const cartCount = Number(profile?.cart_count || 0);

  const saveRecentSearch = (value: string) => {
    const clean = value.trim();
    if (!clean) return;

    const next = [clean, ...recentSearches.filter((item) => item !== clean)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(next);
    writeRecentSearches(next);
  };

  const runTopSearch = (explicitValue?: string) => {
    const q = (explicitValue ?? topSearch).trim();

    if (!q) {
      router.push("/buyer/cookbook");
      setSearchSuggestions([]);
      return;
    }

    saveRecentSearch(q);
    router.push(`/buyer/cookbook?q=${encodeURIComponent(q)}`);
    setSearchFocused(false);
  };

  const clearTopSearch = () => {
    setTopSearch("");
    setSearchSuggestions([]);
    router.push("/buyer/cookbook");
  };

  const goToProfile = () => {
    setProfileOpen(false);
    router.push("/buyer/profile");
  };

  const combinedSuggestionItems = topSearch.trim()
    ? searchSuggestions.map((item) => ({
        kind: "result" as const,
        label: item.title,
        difficulty_level: item.difficulty_level,
      }))
    : [
        ...recentSearches.map((item) => ({
          kind: "recent" as const,
          label: item,
          difficulty_level: null,
        })),
        ...popularSuggestions
          .filter((item) => !recentSearches.includes(item.title))
          .map((item) => ({
            kind: "popular" as const,
            label: item.title,
            difficulty_level: item.difficulty_level,
          })),
      ].slice(0, 8);

  const showSearchDropdown =
    searchFocused &&
    ((topSearch.trim().length > 0 &&
      (searchLoading || combinedSuggestionItems.length >= 0)) ||
      (!topSearch.trim() &&
        (recentSearches.length > 0 || popularSuggestions.length > 0)));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white">
          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <div className="flex items-center gap-4">
              <Image
                src="/Logo.png"
                alt="RecipeChain"
                width={42}
                height={42}
                className="h-auto w-[42px] object-contain"
                priority
              />
              <div className="text-[20px] font-semibold leading-none text-slate-900">
                RecipeChain
              </div>
            </div>
          </div>

          <nav className="space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-4 rounded-2xl px-5 py-4 transition",
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <Icon
                    size={28}
                    className={active ? "text-teal-700" : "text-slate-500"}
                  />
                  <span className="text-[18px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={24} />
              <span className="text-lg font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="h-20 border-b border-slate-200 bg-white px-6">
            <div className="flex h-full w-full items-center gap-6">
              <div className="min-w-0 flex-1">
                {isCookbookPage ? (
                  <div ref={searchRef} className="relative w-full max-w-3xl">
                    <div className="flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm transition duration-200 focus-within:ring-2 focus-within:ring-teal-200">
                      <input
                        value={topSearch}
                        onChange={(e) => setTopSearch(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        placeholder="Search your cookbook"
                        className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (combinedSuggestionItems.length > 0) {
                              setActiveSuggestionIndex((prev) =>
                                prev < combinedSuggestionItems.length - 1 ? prev + 1 : 0
                              );
                            }
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (combinedSuggestionItems.length > 0) {
                              setActiveSuggestionIndex((prev) =>
                                prev > 0 ? prev - 1 : combinedSuggestionItems.length - 1
                              );
                            }
                          } else if (e.key === "Enter") {
                            if (
                              activeSuggestionIndex >= 0 &&
                              combinedSuggestionItems[activeSuggestionIndex]
                            ) {
                              e.preventDefault();
                              const selected =
                                combinedSuggestionItems[activeSuggestionIndex].label;
                              setTopSearch(selected);
                              runTopSearch(selected);
                            } else {
                              runTopSearch();
                            }
                          }
                        }}
                      />

                      {topSearch.trim() ? (
                        <button
                          onClick={clearTopSearch}
                          className="rounded-lg p-1 transition hover:bg-slate-50"
                          aria-label="Clear search"
                        >
                          <X size={18} className="text-slate-400" />
                        </button>
                      ) : null}

                      <button
                        onClick={() => runTopSearch()}
                        className="rounded-lg p-1 transition hover:bg-slate-50"
                        aria-label="Search"
                      >
                        <Search size={19} className="text-slate-500" />
                      </button>
                    </div>

                    {showSearchDropdown ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur transition-all duration-200 ease-out">
                        <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {topSearch.trim() ? "Search suggestions" : "Recent & popular"}
                        </div>

                        {searchLoading ? (
                          <div className="px-5 py-4 text-sm text-slate-500">
                            Searching...
                          </div>
                        ) : combinedSuggestionItems.length > 0 ? (
                          <div className="py-2">
                            {combinedSuggestionItems.map((item, index) => (
                              <button
                                key={`${item.kind}-${item.label}-${index}`}
                                type="button"
                                onClick={() => {
                                  setTopSearch(item.label);
                                  runTopSearch(item.label);
                                }}
                                className={[
                                  "flex w-full items-center justify-between px-5 py-3 text-left transition",
                                  activeSuggestionIndex === index
                                    ? "bg-slate-50"
                                    : "hover:bg-slate-50",
                                ].join(" ")}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  {item.kind === "recent" ? (
                                    <History size={16} className="text-slate-400" />
                                  ) : item.kind === "popular" ? (
                                    <Flame size={16} className="text-amber-500" />
                                  ) : (
                                    <Search size={16} className="text-slate-400" />
                                  )}

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800">
                                      {item.label}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                      {item.kind === "recent"
                                        ? "Recent search"
                                        : item.kind === "popular"
                                        ? `Popular recipe${
                                            item.difficulty_level
                                              ? ` • ${item.difficulty_level}`
                                              : ""
                                          }`
                                        : item.difficulty_level || "Recipe"}
                                    </p>
                                  </div>
                                </div>

                                <ChevronRight
                                  size={16}
                                  className="shrink-0 text-slate-400"
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-4 text-sm text-slate-500">
                            No matching recipes found.
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                          <button
                            type="button"
                            onClick={() => runTopSearch()}
                            className="text-sm font-medium text-teal-700 hover:underline"
                          >
                            View all search results
                          </button>

                          <button
                            type="button"
                            onClick={clearTopSearch}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700"
                          >
                            Back to all recipes
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-[20px] font-semibold leading-tight text-slate-900">
                      {isProfilePage ? "My Profile" : ""}
                    </div>
                    <div className="mt-1 text-[14px] leading-none text-slate-500">
                      {isProfilePage
                        ? "Manage your account, wallet, and activity"
                        : ""}
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-auto flex shrink-0 items-center justify-end gap-3">
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen((s) => !s);
                      setCartOpen(false);
                      setProfileOpen(false);
                    }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-slate-50"
                    aria-label="Notifications"
                  >
                    <Bell size={22} className="text-slate-600" />
                    {notificationCount > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                        {notificationCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(true);
                    setNotifOpen(false);
                    setProfileOpen(false);
                  }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-slate-50"
                  aria-label="Cart"
                >
                  <ShoppingCart size={22} className="text-slate-600" />
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
                    className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-full bg-teal-600 font-semibold text-white ring-2 ring-slate-100"
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
                    <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-[32px] border border-slate-500 bg-white shadow-2xl">
                      <div className="px-7 pt-6">
                        <div className="flex gap-4">
                          {profile?.profile_picture ? (
                            <img
                              src={profile.profile_picture}
                              alt={displayName}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 font-semibold text-white">
                              {avatarText}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="truncate text-[18px] font-semibold text-slate-900">
                              {profileLoading ? "Loading..." : displayName}
                            </div>
                            <div className="truncate text-sm text-slate-500">
                              {profileLoading ? "Loading..." : profileEmail}
                            </div>
                            <div className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                              {profileLoading ? "Loading..." : profileBio}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-5">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            router.push("/buyer/profile");
                          }}
                          className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 mb-4"
                        >
                          {isProfilePage ? "Edit Profile" : "Go to Profile"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-6">{children}</main>
        </div>
      </div>

      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="font-semibold text-slate-900">Your Cart</div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg px-2 py-1 hover:bg-slate-100"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className="p-5 text-sm text-slate-500">
              Cart is not connected yet.
            </div>

            <div className="border-t p-5">
              <button
                onClick={() => setCartOpen(false)}
                className="w-full rounded-2xl bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
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

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
          </div>
        </div>
      }
    >
      <BuyerLayoutContent>{children}</BuyerLayoutContent>
    </Suspense>
  );
}
