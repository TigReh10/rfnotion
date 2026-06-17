import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function JobMatchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/match");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Job Match</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Compare a resume against a job description to see your fit score and gaps.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-8 text-center">
        <p className="text-base font-medium">Matching UI coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The keyword and skill-gap analysis logic is implemented; the side-by-side
          comparison view is next.
        </p>
      </div>
    </main>
  );
}
