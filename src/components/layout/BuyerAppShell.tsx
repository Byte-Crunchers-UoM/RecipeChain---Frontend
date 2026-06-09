import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import BuyerSideBar from "@/components/layout/BuyerSidebar";
import { RecipeFilterProvider } from "@/context/RecipeFilterContext";

export default function BuyerAppShell({ children }: { children: ReactNode }) {
  return (
    <RecipeFilterProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50">
        <Header />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <BuyerSideBar />

          <main className="relative min-w-0 flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </RecipeFilterProvider>
  );
}