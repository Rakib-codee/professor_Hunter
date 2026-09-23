'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from 'cn';

export interface NavLink {
  href: string;
  label: string;
}

// Section links for the dark header (DESIGN.md §8): small caps-tracked labels, the current one in
// white with a 2 px gold bar on the header's bottom edge. On small screens the links sit behind a
// hamburger button and drop down as a full-width list. Same links, same hrefs, no new routes.
export function NavLinks({
  links,
  children,
}: {
  links: NavLink[];
  /** Trailing controls (Log in / Log out) that stay visible on every width. */
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  const hasMenu = links.length > 1;

  const desktopItems = links.map((link) => (
    <li key={link.href} className="flex">
      <Link
        href={link.href}
        aria-current={isCurrent(link.href) ? 'page' : undefined}
        className={cn(
          'relative flex items-center px-1 text-[13px] font-semibold tracking-[0.12em] uppercase',
          'text-white/70 transition-colors duration-150 hover:text-white',
          'aria-[current=page]:text-white',
          'aria-[current=page]:after:bg-gold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5',
        )}
      >
        {link.label}
      </Link>
    </li>
  ));

  const mobileItems = links.map((link) => (
    <li key={link.href}>
      <Link
        href={link.href}
        aria-current={isCurrent(link.href) ? 'page' : undefined}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex min-h-11 items-center border-l-2 border-transparent px-3 text-[15px] font-semibold text-white/80',
          'aria-[current=page]:border-gold aria-[current=page]:text-gold hover:text-white',
        )}
      >
        {link.label}
      </Link>
    </li>
  ));

  return (
    <nav className="flex h-full items-center gap-3 md:gap-5" aria-label="Main">
      <ul className="hidden h-14 items-stretch gap-6 md:flex md:h-16">{desktopItems}</ul>
      {children}
      {hasMenu ? (
        <button
          type="button"
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm text-white md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
        </button>
      ) : null}
      {hasMenu && isOpen ? (
        <ul
          id="mobile-nav"
          className="site-header absolute inset-x-0 top-full flex flex-col gap-1 px-4 pt-2 pb-3 md:hidden"
        >
          {mobileItems}
        </ul>
      ) : null}
    </nav>
  );
}
