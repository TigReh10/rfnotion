export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div className="h-7 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border bg-card p-6">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
            <div className="mt-4 h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
