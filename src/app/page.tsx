//src/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeView from "./home/HomeView";

/**
 * Root Home Page
 *
 * Checks user authentication and redirects:
 * - Sellers → /seller/dashboard
 * - Buyers → /buyer/dashboard
 * - Unauthenticated → /signup
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("recipe_chain_role")?.value;

  if (role === "seller") redirect("/seller/dashboard");
  if (role === "buyer") redirect("/buyer/dashboard");

  return <HomeView />;
}
