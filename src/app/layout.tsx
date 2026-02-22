import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Header } from "@/components/ui/Header";
import "./globals.css";
// Make sure this path is correct for your file structure
import Sidebar from "@/components/layout/MainSidebar"; 

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
        className={`${inter.variable} ${geistMono.variable} font-inter antialiased flex bg-gray-50 min-h-screen`}
      >
       
        <Sidebar />

        {/* 2. Main Content sits here (Takes remaining space) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
             {children}
          </div>
        </main>

      </body>
    </html>
  );
}