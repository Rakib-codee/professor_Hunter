import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        The link may be old, or the professor may have been removed from the list.
      </p>
      <div className="flex gap-2">
        <Link href="/find" className={buttonVariants()}>
          Find professors
        </Link>
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          Home
        </Link>
      </div>
    </main>
  );
}
