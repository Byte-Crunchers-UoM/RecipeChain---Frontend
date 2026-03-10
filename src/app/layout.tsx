import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/MainSidebar"; 
import Header from "@/components/layout/Header"; 

import { RecipeFilterProvider } from "@/lib/context/RecipeFilterContext";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeChain",
  description: "A blockchain-based recipe sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} font-inter antialiased flex flex-col bg-gray-50 h-screen overflow-hidden`}
      >
        <RecipeFilterProvider>
        <Header cartCount={2} notificationCount={1} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        </RecipeFilterProvider>
      </body>
    </html>
  );
}