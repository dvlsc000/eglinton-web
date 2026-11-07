import { Skeleton } from "@/components/ui/primitives";

/** Shown while a route's data loads. Mirrors the page-header + rows rhythm to avoid layout jump. */
export function PageSkeleton() {
  return (
    <div className="surface-ink" role="status" aria-label="Loading">
      <div className="container-site pt-12 pb-12 md:pt-20 md:pb-16">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-8 h-14 w-full max-w-xl" />
        <Skeleton className="mt-4 h-14 w-full max-w-md" />
        <Skeleton className="mt-8 h-4 w-full max-w-lg" />
      </div>
      <div className="container-site pb-28">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-line py-5">
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
