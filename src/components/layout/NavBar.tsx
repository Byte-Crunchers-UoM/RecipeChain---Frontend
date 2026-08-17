"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import CartBadge from "@/components/recipe/CartBadge";
import TopNavProfileMenu from "@/components/layout/TopNavProfileMenu";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const handleHowItWorksClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();

      const section = document.getElementById("how-it-works");

      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="relative z-50 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm px-8 py-5">
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <Image
          src="/Logo.png"
          alt="RecipeChain Logo"
          width={36}
          height={36}
          priority
          className="h-9 w-auto"
        />

        <div className="text-xl font-bold tracking-tight text-slate-800">
          RecipeChain
        </div>
      </Link>

      <div className="hidden items-center gap-8 font-medium text-slate-600 md:flex">
        <Link
          href="/recipes"
          className="transition-colors hover:text-[#16a34a]"
        >
          Marketplace
        </Link>

        <Link
          href="/#how-it-works"
          onClick={handleHowItWorksClick}
          className="transition-colors hover:text-[#16a34a]"
        >
          How It Works
        </Link>

        <Link
          href="/trending"
          className="transition-colors hover:text-[#16a34a]"
        >
         Trending Recipes
        </Link>
      </div>

      <div className="flex items-center gap-5 font-medium">
        {isLoading ? (
          <div className="animate-pulse text-sm text-slate-600">
            Loading...
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4">
            <CartBadge />
            <TopNavProfileMenu mode="home" />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden font-medium text-slate-700 transition-colors hover:text-slate-900 sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-teal-600"
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">Start Cooking</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};