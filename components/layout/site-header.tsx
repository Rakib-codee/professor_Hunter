import Link from 'next/link';
import { NavLinks, type NavLink } from '@/components/layout/nav-links';

// One header for every shell (DESIGN.md §3). Wordmark left, section links with the current one
// underlined, session control right.
export function SiteHeader({
  homeHref,
  links,
  children,
  brand = 'Professor Hunter',
}: {
  homeHref: string;
  links: NavLink[];
  children?: React.ReactNode;
  brand?: string;
}) {
  return (
    <header className="border-border bg-background relative border-b">
      {/* Full-bleed: wordmark at the left edge, session controls at the right edge. */}
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        <Link href={homeHref} className="text-[17px] font-semibold tracking-tight">
          {brand}
        </Link>
        <NavLinks links={links}>{children}</NavLinks>
      </div>
    </header>
  );
}
