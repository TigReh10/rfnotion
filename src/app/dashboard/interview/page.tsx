import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/interview");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Interview Prep</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Practice likely behavioral and technical questions with model answers.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-8 text-center">
        <p className="text-base font-medium">Question generator coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The prompt templates and data model are in place; the interactive prep
          session view is next.
        </p>
      </div>
    </main>
  );
}
