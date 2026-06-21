import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

/**
 * Shared marketing header used across public pages (landing, pricing, legal).
 * Fixed to the top with a translucent backdrop.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="rounded-full bg-background/70 px-3 py-2 backdrop-blur transition hover:bg-background/90 sm:px-4"
          aria-label="ResumeForge AI home"
        >
          {/* Full wordmark on >=sm, compact mark-only on small phones to avoid overlap */}
          <Logo className="hidden sm:inline-flex" />
          <Logo withText={false} className="sm:hidden" />
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-background/70 px-2 py-1.5 text-sm backdrop-blur sm:gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground sm:inline-block"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-muted-foreground transition hover:text-foreground sm:px-4"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground transition hover:scale-[1.03] sm:px-4"
          >
            Get started
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
