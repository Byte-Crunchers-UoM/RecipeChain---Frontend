"use client";

import { Home, LayoutDashboard, TrendingUp, BookOpen, ChefHat, User, LogOut, FileText } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import logo from "../../Recipe Chain logo.png";

const icons: Record<string, React.ElementType> = { Home, LayoutDashboard, TrendingUp, BookOpen, ChefHat, User, LogOut, FileText };

const Sidebar = () => {
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
    { name: "Home", icon: "Home", active: false },
    { name: "Market Place", icon: "LayoutDashboard", active: false },
    { name: "Trending Recipes", icon: "TrendingUp", active: false },
    { name: "My Cookbook", icon: "BookOpen", active: false },
    { name: "Chefs", icon: "ChefHat", active: true },
    { name: "Profile", icon: "User", active: false },
  ];

  const getIcon = (iconName: string, active: boolean) => {
    const Icon = icons[iconName];
    if (!Icon) return null;

    if (iconName === "LogOut") {
      return <Icon size={20} />;
    }
    return <Icon size={20} />;
  };

  return (
    <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-screen shrink-0 sticky top-0">
      <div className="px-6 py-8 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center">
            <Image src={logo} alt="RecipeChain Logo" width={40} height={40} className="h-10 w-auto object-contain" priority quality={100} />
          </div>
          <span className="font-bold text-xl text-[var(--text)]">RecipeChain</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              item.active
                ? "bg-secondary text-primary font-semibold border-l-4 border-primary shadow-sm"
                : "text-muted hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <span className={item.active ? "text-primary" : "text-muted group-hover:text-primary"}>
              {getIcon(item.icon, item.active)}
            </span>
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
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