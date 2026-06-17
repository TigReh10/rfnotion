import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CoverLettersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/cover-letters");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Cover Letters</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Generate a tailored, tone-controlled cover letter for any role.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-8 text-center">
        <p className="text-base font-medium">Generator coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          AI prompts and tone options are defined; the editor and export view are
          the next milestone.
        </p>
      </div>
    </main>
  );
}
