"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you would report to an error monitor (e.g. Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-extrabold text-primary/20">500</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
