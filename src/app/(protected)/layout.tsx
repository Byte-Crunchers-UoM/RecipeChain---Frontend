import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import BuyerSideBar from "@/components/layout/BuyerSidebar";
import { RecipeFilterProvider } from "@/context/RecipeFilterContext";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <RecipeFilterProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50">
        <BuyerSideBar />
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          <Header notificationCount={1} />
          <main className="flex-1 overflow-y-auto relative w-full">
            {children}
          </main>
        </div>
      </div>
    </RecipeFilterProvider>
  );
}