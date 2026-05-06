// src/app/recipes/layout.tsx
import { ReactNode } from "react";
import { RecipeFilterProvider } from "@/context/RecipeFilterContext";
import BuyerSidebar from "@/components/layout/BuyerSidebar";
import { Footer } from "@/components/layout/Footer";

// 👇 Must have "export default"
export default function RecipesLayout({ children }: { children: ReactNode }) {
  return (
    <RecipeFilterProvider>
      <div className="flex flex-1 overflow-hidden h-screen">
        
        <BuyerSidebar />
        
        <main className="flex-1 overflow-y-auto flex flex-col bg-white">
          <div className="flex-1">
            {children}
          </div>
          
          <Footer />
        </main>
        
      </div>
    </RecipeFilterProvider>
  );
}