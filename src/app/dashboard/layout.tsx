import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

/**
 * Server-side auth guard for every /dashboard route, plus the shared dashboard
 * chrome (sidebar + top bar). Feature pages stay pure content components.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return <DashboardShell userEmail={user.email}>{children}</DashboardShell>;
}
