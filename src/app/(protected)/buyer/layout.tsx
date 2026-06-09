import { ReactNode } from "react";
import BuyerAppShell from "@/components/layout/BuyerAppShell";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <BuyerAppShell>{children}</BuyerAppShell>;
}