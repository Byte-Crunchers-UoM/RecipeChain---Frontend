import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/MainSidebar"; 
import Header from "@/components/layout/Header"; 

import { RecipeFilterProvider } from "@/lib/context/RecipeFilterContext";
import { RecipeCartProvider } from "@/lib/context/RecipeCartContext";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecipeChain",
  description: "A blockchain-based recipe sharing platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} font-inter antialiased flex flex-col bg-gray-50 h-screen overflow-hidden`}>
        
        <RecipeCartProvider>
          <RecipeFilterProvider>
            
            <Header notificationCount={1} /> 

            {/* The main layout wrapper */}
            <div className="flex flex-1 overflow-hidden">
              
              <Sidebar />
              
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
        
      </body>
    </html>
  );
}