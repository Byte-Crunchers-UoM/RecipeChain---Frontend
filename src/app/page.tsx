import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies(); // ✅ await because cookies() is async in your Next version
  const role = cookieStore.get("recipe_chain_role")?.value;

  if (role === "seller") redirect("/seller/dashboard");
  if (role === "buyer") redirect("/buyer/dashboard");

  redirect("/signup");
}
