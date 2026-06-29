import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";
import { Footer } from "@/components/layout/Footer";
import AiChatbot from "@/components/chat/AiChatbot";

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
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-inter antialiased bg-gray-50 min-h-screen`}>
        <Providers>
          {children}
          <RecipeCartOverlay />
          <Footer />
        </Providers>

        {/* Rendered at the absolute root to prevent clipping */}
        <AiChatbot />
      </body>
    </html>
  );
}