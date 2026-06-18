import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-7xl font-extrabold text-primary/20">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03]"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
