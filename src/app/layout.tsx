// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist, Outfit, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";
import { Footer } from "@/components/layout/Footer";
import Sidebar from "@/components/Sidebar";
import { NotificationProvider } from "@/components/NotificationContext";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

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
  title: "RecipeChain - Blockchain Recipe Marketplace",
  description: "A blockchain-powered recipe marketplace (Recipe • AI • Crypto)",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${roboto.variable} font-inter antialiased bg-[#f8fafc] min-h-screen`}>
        {/* All global providers are neatly tucked away here */}
        <Providers>
          <div className="flex min-h-screen">
            <NotificationProvider>
              {/* Only show sidebar if it was meant to be global, or perhaps it was added in the merge */}
              <Sidebar />
              <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
                <Footer />
              </div>
            </NotificationProvider>
          </div>

          {/* The cart overlay lives at the root so it can pop open over any page */}
          <RecipeCartOverlay />
        </Providers>
      </body>
    </html>
  );
}