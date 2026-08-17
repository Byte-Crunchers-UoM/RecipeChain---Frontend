import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist, Outfit, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import RecipeCartOverlay from "@/components/recipe/RecipeCartOverlay";
import AppShell from "@/components/layout/AppShell";
import AiChatbot from "@/components/chat/AiChatbot";

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
          <AppShell>
            {children}
          </AppShell>

          {/* The cart overlay lives at the root so it can pop open over any page */}
          <RecipeCartOverlay />
        </Providers>

        {/* Rendered at the absolute root to prevent clipping */}
        <AiChatbot />
      </body>
    </html>
  );
}