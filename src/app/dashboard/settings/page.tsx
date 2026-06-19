import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?next=/dashboard/settings");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      email: true,
      provider: true,
      twoFactorEnabled: true,
      subscription: {
        select: {
          status: true,
          plan: { select: { name: true } },
        },
      },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account, security and subscription.
      </p>
      <SettingsClient
        email={user.email}
        planName={user.subscription?.plan.name ?? "Free"}
        planStatus={user.subscription?.status ?? null}
        twoFactorEnabled={user.twoFactorEnabled}
        canChangePassword={user.provider === "CREDENTIALS"}
      />
    </div>
  );
}
