import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { NavLinks, type NavLink } from '@/components/layout/nav-links';

// One header for every shell (DESIGN.md §8). Dark Ink bar, sticky, full-bleed: logo lockup at the
// left edge, section links with the current one marked in gold, session control at the right edge.
// .site-header re-scopes the colour tokens so buttons passed as children pick up the dark theme.
export function SiteHeader({
  homeHref,
  links,
  children,
  section,
}: {
  homeHref: string;
  links: NavLink[];
  children?: React.ReactNode;
  /** Optional area tag shown after the wordmark, e.g. "Admin". */
  section?: string;
}) {
  return (
    <header className="site-header sticky top-0 z-30">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5 rounded-sm outline-offset-4"
          aria-label={section ? `Professor Hunter ${section} home` : 'Professor Hunter home'}
        >
          <Logo />
          {section ? (
            <span className="text-gold border-gold/60 rounded-sm border px-1.5 py-0.5 text-[11px] leading-none font-semibold tracking-[0.12em] uppercase">
              {section}
            </span>
          ) : null}
        </Link>
        <NavLinks links={links}>{children}</NavLinks>
      </div>
    </header>
  );
}
