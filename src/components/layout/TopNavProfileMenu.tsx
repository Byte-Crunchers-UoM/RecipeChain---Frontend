"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LogOut,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getMyBuyerProfile } from "@/lib/api/buyer";
import type { BuyerProfile } from "@/lib/types/buyer";

type ProfileMenuMode = "contextual" | "home";

type TopNavProfileMenuProps = {
  mode?: ProfileMenuMode;
};

type DropdownLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AuthUserLike = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = String(name || email || "U").trim();

  return (
    source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default function TopNavProfileMenu({
  mode = "contextual",
}: TopNavProfileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const authUser = user as AuthUserLike | null;
  const isBuyer = authUser?.role === "buyer";

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!isBuyer) return;

    try {
      setProfileLoading(true);
      const buyerProfile = await getMyBuyerProfile();
      setProfile(buyerProfile);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    if (!isAuthenticated || !isBuyer) return;

    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    const handleProfileUpdated = () => {
      void loadProfile();
    };

    window.addEventListener("buyer-profile-updated", handleProfileUpdated);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("buyer-profile-updated", handleProfileUpdated);
    };
  }, [isAuthenticated, isBuyer, loadProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuLinks = useMemo<DropdownLink[]>(() => {
    if (mode === "home") {
      return [
        { label: "Marketplace", href: "/recipes", icon: Store },
        { label: "My Cookbook", href: "/buyer/cookbook", icon: BookOpen },
        { label: "My Profile", href: "/buyer/profile", icon: User },
      ];
    }

    if (pathname === "/buyer/cookbook") {
      return [
        { label: "Marketplace", href: "/recipes", icon: Store },
        { label: "My Profile", href: "/buyer/profile", icon: User },
      ];
    }

    if (pathname === "/buyer/profile") {
      return [
        { label: "Marketplace", href: "/recipes", icon: Store },
        { label: "My Cookbook", href: "/buyer/cookbook", icon: BookOpen },
      ];
    }

    return [
      { label: "My Profile", href: "/buyer/profile", icon: User },
      { label: "My Cookbook", href: "/buyer/cookbook", icon: BookOpen },
    ];
  }, [mode, pathname]);

  const activeProfile = isBuyer ? profile : null;

  const displayName = String(
    activeProfile?.display_name || authUser?.name || authUser?.email || "Buyer"
  ).trim();

  const email = String(activeProfile?.email || authUser?.email || "").trim();
  const bio = String(activeProfile?.bio || "").trim();
  const profilePicture = String(activeProfile?.profile_picture || "").trim();
  const avatarText = getInitials(displayName, email);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout?.();
    router.replace("/login");
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-teal-600 text-sm font-semibold text-white shadow-sm ring-2 ring-white transition hover:bg-teal-700"
        aria-label="Open profile menu"
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          avatarText
        )}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-600 text-base font-semibold text-white ring-2 ring-white">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {profileLoading ? "Loading..." : displayName}
                </p>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {profileLoading ? "Loading..." : email || "Buyer account"}
                </p>

                <p className="mt-2 truncate text-xs leading-5 text-slate-400">
                  {profileLoading
                    ? "Loading profile..."
                    : bio || "XRPL buyer • Recipe collector"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3">
            {menuLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}