import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { AuthProvider } from "@/context/AuthContext";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3AuthProvider>
          <AuthProvider>{children}</AuthProvider>
        </Web3AuthProvider>
      </body>
    </html>
  );
}
