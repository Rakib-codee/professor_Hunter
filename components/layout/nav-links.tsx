'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from 'cn';

export interface NavLink {
  href: string;
  label: string;
}

// Current section underlined in Cobalt; on small screens the links collapse behind "Menu".
// Pure presentation: the same links, same hrefs, no new routes.
export function NavLinks({
  links,
  children,
}: {
  links: NavLink[];
  /** Trailing controls (Log in / Log out) that stay visible on every width. */
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const items = links.map((link) => (
    <li key={link.href}>
      <Link
        href={link.href}
        aria-current={isCurrent(link.href) ? 'page' : undefined}
        onClick={() => setOpen(false)}
        className={cn(
          'hover:border-border block border-b-2 border-transparent px-1 py-2.5 text-[15px] font-medium',
          'aria-[current=page]:border-primary aria-[current=page]:text-primary',
        )}
      >
        {link.label}
      </Link>
    </li>
  ));

  return (
    <nav className="flex items-center gap-2" aria-label="Main">
      <ul className="hidden items-center gap-4 md:flex">{items}</ul>
      {children}
      {links.length > 1 ? (
        <button
          type="button"
          className="border-control h-10 rounded-sm border px-3 text-[15px] font-medium md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      ) : null}
      {open ? (
        <ul
          id="mobile-nav"
          className="bg-background border-border absolute inset-x-0 top-full z-20 flex flex-col border-b px-4 pb-2 md:hidden"
        >
          {items}
        </ul>
      ) : null}
    </nav>
  );
}
