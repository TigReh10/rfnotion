import { cn } from "@/lib/utils";

/** The square brand mark (indigo tile + upward "boost" arrow). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      role="img"
      aria-label="ResumeForge AI"
    >
      <rect width="32" height="32" rx="7" className="fill-primary" />
      <path d="M16 7 L24 17 L19 17 L19 25 L13 25 L13 17 L8 17 Z" fill="white" />
    </svg>
  );
}

/** Full lockup: brand mark + wordmark. Set withText={false} for the mark only. */
export function Logo({
  withText = true,
  className,
  markClassName,
}: {
  withText?: boolean;
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {withText ? (
        <span className="text-sm font-bold tracking-tight">ResumeForge AI</span>
      ) : null}
    </span>
  );
}
