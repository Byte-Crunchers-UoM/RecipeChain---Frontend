import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationContext";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Chef Profile | RecipeChain",
  description: "A blockchain-based recipe sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-roboto antialiased bg-[var(--background)] text-[var(--text)]`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
