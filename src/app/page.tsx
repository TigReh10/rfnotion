import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Features, Showcase, Steps, CallToAction } from "@/components/landing/sections";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="relative">
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
              className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground"
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

      <main>
        <Hero />
        <Features />
        <Showcase />
        <Steps />
        <CallToAction />
      </main>

      <footer className="border-t px-6 py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ResumeForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
