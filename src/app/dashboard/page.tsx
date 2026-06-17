import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const FEATURES = [
  { title: "Analyze a resume", desc: "Upload a resume and get an ATS score + fixes.", href: "/dashboard/resumes" },
  { title: "Job match", desc: "Compare a resume against a job description.", href: "/dashboard/match" },
  { title: "Cover letters", desc: "Generate a tailored cover letter.", href: "/dashboard/cover-letters" },
  { title: "Interview prep", desc: "Practice likely questions with model answers.", href: "/dashboard/interview" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="rounded-md border px-4 py-2 text-sm font-medium">Sign out</button>
        </form>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="rounded-xl border bg-card p-6 transition hover:border-primary"
          >
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
