import { ReactNode } from "react";
import BuyerAppShell from "@/components/layout/BuyerAppShell";

export default function RecipesLayout({ children }: { children: ReactNode }) {
  return <BuyerAppShell>{children}</BuyerAppShell>;
}