import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Server-side auth guard for every /dashboard route. Individual feature pages
 * can therefore be pure client components without repeating the auth check.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return <>{children}</>;
}
