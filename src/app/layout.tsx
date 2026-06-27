// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";
import { Footer } from "@/components/layout/Footer";
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecipeChain - Blockchain Recipe Marketplace",
  description: "A blockchain-powered recipe marketplace (Recipe • AI • Crypto)",
  import { Inter, Outfit, Roboto } from "next/font/google";
  import "./globals.css";
  import Sidebar from "@/components/Sidebar";
  import { NotificationProvider } from "@/components/NotificationContext";

  const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
  });

  const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
  });

  const roboto = Roboto({
    weight: ["400", "500", "700"],
    variable: "--font-roboto",
    subsets: ["latin"],
  });

  export const metadata: Metadata = {
    title: "RecipeChain | Blockchain Recipe Marketplace",
    description: "Discover amazing recipes from your followed chefs on the blockchain-powered marketplace",
  };

  export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
      <html lang="en">
        <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-inter antialiased bg-gray-50 min-h-screen`}>

          {/* All global providers are neatly tucked away here */}
          <Providers>
            {children}

            {/* The cart overlay lives at the root so it can pop open over any page */}
            <RecipeCartOverlay />

            {/* Global Footer */}
            <Footer />
          </Providers>

          <body className={`${inter.variable} ${outfit.variable} ${roboto.variable} antialiased bg-[#f8fafc]`}>
            <div className="flex min-h-screen">
              <NotificationProvider>
                <Sidebar />
                <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
                  <main className="flex-1 overflow-y-auto">
                    {children}
                  </main>
                </div>
              </NotificationProvider>
            </div>
          </body>
      </html>
    );
}