import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

import { NotificationProvider } from "@/components/NotificationContext";
import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { AuthProvider } from "@/context/AuthContext";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeChain - Blockchain Recipe Marketplace",
  description: "A blockchain-powered recipe marketplace (Recipe • AI • Crypto)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--text)]`}>
        <Web3AuthProvider>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </Web3AuthProvider>
      </body>
    </html>
  );
}
