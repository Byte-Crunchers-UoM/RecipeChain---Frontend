import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecipeChain",
  description: "A blockchain-based recipe sharing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F2F2F2]">
        {children}
      </body>
    </html>
  );
}
