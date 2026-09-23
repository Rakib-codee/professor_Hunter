import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4" aria-busy>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-32 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  );
}
