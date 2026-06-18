import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Shared marketing header used across public pages (landing, pricing, legal).
 * Fixed to the top with a translucent backdrop.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="rounded-full bg-background/70 px-4 py-2 text-sm font-bold backdrop-blur"
        >
          ResumeForge AI
        </Link>
        <nav className="flex items-center gap-2 rounded-full bg-background/70 px-2 py-1.5 text-sm backdrop-blur">
          <Link
            href="/pricing"
            className="hidden rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground sm:inline-block"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground transition hover:scale-[1.03]"
          >
            Get started
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
