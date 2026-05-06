//src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import BuyerSideBar from "@/components/layout/BuyerSidebar"; 

import { RecipeFilterProvider } from "@/context/RecipeFilterContext";
import { RecipeCartProvider } from "@/context/RecipeCartContext";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";
import { Footer } from "@/components/layout/Footer";
import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import BuyerSidebar from "@/components/layout/BuyerSidebar";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecipeChain - Blockchain Recipe Marketplace",
  description: "A blockchain-powered recipe marketplace (Recipe • AI • Crypto)",
};

/** Root layout component that wraps the entire application with global providers, fonts, and UI structure. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-inter antialiased flex flex-col bg-gray-50 h-screen overflow-hidden`}>
        <Web3AuthProvider>
          <AuthProvider>
            <RecipeCartProvider>
              <RecipeFilterProvider>
                {/* The main layout wrapper */}
                <div className="flex flex-1 overflow-hidden">
                  
                  <BuyerSidebar />
                  
                  {/* Added flex flex-col here so the Footer is pushed below the children */}
                  <main className="flex-1 overflow-y-auto flex flex-col bg-white">
                    
                    {/* Wrap children in a flex-1 div so they expand and push the footer down if the page is short */}
                    <div className="flex-1">
                      {children}
                    </div>

                    {/* Footer is now INSIDE the scrollable area */}
                    <Footer />

                  </main>

                </div>

                <RecipeCartOverlay />

              </RecipeFilterProvider>
            </RecipeCartProvider>
          </AuthProvider>
        </Web3AuthProvider>
      </body>
    </html>
  );
}