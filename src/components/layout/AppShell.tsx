"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { Navbar } from "@/components/layout/NavBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f8fafc]">
      {/* Global Header */}
      {!isHomePage && <Header />}
      {isHomePage && <Navbar />}
      
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
