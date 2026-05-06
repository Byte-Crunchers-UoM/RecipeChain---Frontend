// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecipeChain - Blockchain Recipe Marketplace",
  description: "A blockchain-powered recipe marketplace (Recipe • AI • Crypto)",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-inter antialiased bg-gray-50 h-screen overflow-hidden`}>
        
        {/* All global providers are neatly tucked away here */}
        <Providers>
          {children}
          
          {/* The cart overlay lives at the root so it can pop open over any page */}
          <RecipeCartOverlay />
        </Providers>

      </body>
    </html>
  );
}