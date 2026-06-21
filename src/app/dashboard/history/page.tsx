import { redirect } from "next/navigation";
import Link from "next/link";
import { History, FileSearch } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  PROCESSING: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  PENDING: "bg-muted text-muted-foreground border-border",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/30",
};

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/history");

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Every resume you've analyzed, with its latest ATS score and status.
        </p>
      </header>

      {resumes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <FileSearch className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No history yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Analyze your first resume and it will show up here so you can track your progress over time.
          </p>
          <Link
            href="/dashboard/resumes"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Analyze a resume
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Resume</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Analyzed</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r) => {
                const latest = r.analyses[0];
                const status = latest?.status ?? "PENDING";
                const score = latest?.overallScore;
                return (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 transition hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.title}</td>
                    <td className="px-4 py-3">
                      {typeof score === "number" ? (
                        <span className="font-semibold">{score}</span>
                      ) : (
                        <span className="text-muted-foreground">\u2014</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>
                        {status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
