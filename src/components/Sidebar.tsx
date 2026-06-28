"use client";

import { useState } from "react";
import { Home, LayoutDashboard, TrendingUp, BookOpen, ChefHat, User, LogOut, FileText, ChevronDown, ChevronRight, Info, Search, Heart } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../Recipe Chain logo.png";

const icons: Record<string, React.ElementType> = { Home, LayoutDashboard, TrendingUp, BookOpen, ChefHat, User, LogOut, FileText, Info, Search, Heart };

const Sidebar = () => {
  const pathname = usePathname();
  const [chefsOpen, setChefsOpen] = useState(true);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { name: "Home", icon: "Home", href: "/" },
    { name: "Market Place", icon: "LayoutDashboard", href: "/marketplace" },
    { name: "Trending Recipes", icon: "TrendingUp", href: "/recipes" }, // Adjusted path based on typical routing
    { name: "My Cookbook", icon: "BookOpen", href: "/buyer/cookbook" },
  ];

  const chefsSubItems = [
    { name: "About Us", icon: "Info", href: "/about" },
    { name: "Explore Chefs", icon: "Search", href: "/chefs/explore" },
    { name: "Followed Chefs", icon: "Heart", href: "/chefs/followed" },
  ];

  const getIcon = (iconName: string, active: boolean, size: number = 20) => {
    const Icon = icons[iconName];
    if (!Icon) return null;
    return <Icon size={size} />;
  };

  return (
    <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-screen shrink-0 sticky top-0 overflow-y-auto">
      <div className="px-6 py-8 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex items-center justify-center">
            <Image src={logo} alt="RecipeChain Logo" width={40} height={40} className="h-10 w-auto object-contain" priority quality={100} />
          </div>
          <span className="font-bold text-xl text-[var(--text)]">RecipeChain</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6 pb-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-secondary text-primary font-semibold border-l-4 border-primary shadow-sm"
                  : "text-muted hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <span className={isActive ? "text-primary" : "text-muted group-hover:text-primary"}>
                {getIcon(item.icon, isActive)}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Chefs Expandable Section */}
        <div className="pt-2">
          <button
            onClick={() => setChefsOpen(!chefsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
              pathname?.startsWith("/chefs") || pathname === "/about"
                ? "bg-secondary text-primary font-semibold shadow-sm"
                : "text-muted hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={pathname?.startsWith("/chefs") ? "text-primary" : "text-muted group-hover:text-primary"}>
                <ChefHat size={20} />
              </span>
              <span className="text-sm font-medium">Chefs</span>
            </div>
            {chefsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Sub Items */}
          {chefsOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
              {chefsSubItems.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                return (
                  <Link
                    href={subItem.href}
                    key={subItem.name}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isSubActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted hover:bg-gray-50 hover:text-primary"
                    }`}
                  >
                    <span className={isSubActive ? "text-primary" : "text-gray-400 group-hover:text-primary"}>
                      {getIcon(subItem.icon, isSubActive, 18)}
                    </span>
                    <span className="text-sm">{subItem.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/profile"
          className={`w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl transition-all duration-200 group ${
            pathname === "/profile"
              ? "bg-secondary text-primary font-semibold border-l-4 border-primary shadow-sm"
              : "text-muted hover:bg-gray-50 hover:text-primary"
          }`}
        >
          <span className={pathname === "/profile" ? "text-primary" : "text-muted group-hover:text-primary"}>
            <User size={20} />
          </span>
          <span className="text-sm font-medium">Profile</span>
        </Link>
      </nav>

      <div className="p-8 border-t border-gray-100 mt-auto">
        <div 
          onClick={handleLogout}
          className="px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer flex items-center gap-3.5 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-colors" strokeWidth={2} />
          <span className="font-semibold text-[15px]">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;