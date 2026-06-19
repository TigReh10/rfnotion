import { redirect } from "next/navigation";
import Link from "next/link";
import { FileSearch, Target, PenLine, MessagesSquare, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ACTIONS = [
  {
    title: "Analyze a resume",
    desc: "Upload a resume and get an ATS score plus prioritized fixes.",
    href: "/dashboard/resumes",
    icon: FileSearch,
  },
  {
    title: "Job match",
    desc: "Compare a resume against a job description and see your fit %.",
    href: "/dashboard/match",
    icon: Target,
  },
  {
    title: "Cover letters",
    desc: "Generate a tailored, tone-controlled cover letter in seconds.",
    href: "/dashboard/cover-letters",
    icon: PenLine,
  },
  {
    title: "Interview prep",
    desc: "Practice likely questions with strong model answers.",
    href: "/dashboard/interview",
    icon: MessagesSquare,
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const name = user.email.split("@")[0];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off or start something new.
        </p>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.title}
              href={a.href}
              className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 flex items-center gap-1.5 font-semibold">
                {a.title}
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
