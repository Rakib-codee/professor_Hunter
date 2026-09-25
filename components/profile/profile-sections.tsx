'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import {
  PROFILE_SECTIONS,
  nextSection,
  sectionElementId,
  sectionForField,
  type MissingBySection,
  type ProfileSectionId,
} from '@/lib/profile/sections';

// Profile layout. Desktop (lg): a sticky column with the completeness summary and a section
// list whose current item follows the scroll; all three forms on the right. Phones: the same
// list becomes tabs and only the active section is shown, with a "Next" button under each.
// The active section is derived from the URL hash, so a "Missing: IELTS" link (#ielts) and a
// tab (#section-application) both work, on both layouts, and survive a reload.

const SCROLL_SPY_MARGIN = '-20% 0px -60% 0px';
const TABS_ID = 'profile-tabs';

// Tiny hash store: hashchange covers anchor clicks; navigateHash covers our own replaceState.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('hashchange', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('hashchange', listener);
  };
}
const getSnapshot = () => window.location.hash;
const getServerSnapshot = () => '';
function navigateHash(hash: string) {
  window.history.replaceState(null, '', hash);
  listeners.forEach((listener) => listener());
}

function sectionFromHash(hash: string): ProfileSectionId {
  const target = hash.startsWith('#') ? hash.slice(1) : '';
  const byAnchor = PROFILE_SECTIONS.find((section) => sectionElementId(section.id) === target);
  return byAnchor?.id ?? sectionForField(target) ?? 'about';
}

function focusField(hash: string) {
  const field = hash.startsWith('#') ? hash.slice(1) : '';
  if (!field || !sectionForField(field)) return;
  const element = document.getElementById(field);
  if (!element) return;
  const focusable =
    element instanceof HTMLFieldSetElement
      ? element.querySelector<HTMLElement>('input, select, textarea')
      : element;
  element.scrollIntoView({ block: 'center' });
  focusable?.focus({ preventScroll: true });
}

function MissingState({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-[13px]">
        <CheckIcon className="size-3.5" aria-hidden="true" />
        Complete
      </span>
    );
  }
  return <span className="text-muted-foreground tnum text-[13px]">{count} missing</span>;
}

interface ProfileSectionsProps {
  missing: MissingBySection;
  /** The completeness bar, rendered on the server. */
  summary: ReactNode;
  sections: Record<ProfileSectionId, ReactNode>;
}

export function ProfileSections({ missing, summary, sections }: ProfileSectionsProps) {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const active = sectionFromHash(hash);
  const [current, setCurrent] = useState<ProfileSectionId>('about');
  const intersecting = useRef(new Set<ProfileSectionId>());

  // A field link (#cgpa) scrolls to and focuses its input once its section is on screen.
  useEffect(() => focusField(hash), [hash]);

  // Scroll spy for the desktop list: the first section (in page order) inside the band.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace('section-', '') as ProfileSectionId;
          if (entry.isIntersecting) intersecting.current.add(id);
          else intersecting.current.delete(id);
        });
        const first = PROFILE_SECTIONS.find((section) => intersecting.current.has(section.id));
        if (first) setCurrent(first.id);
      },
      { rootMargin: SCROLL_SPY_MARGIN },
    );
    PROFILE_SECTIONS.forEach((section) => {
      const element = document.getElementById(sectionElementId(section.id));
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const showSection = (id: ProfileSectionId) => {
    navigateHash(`#${sectionElementId(id)}`);
    document.getElementById(TABS_ID)?.scrollIntoView({ block: 'start' });
  };

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-12">
      <aside className="flex flex-col gap-5 lg:sticky lg:top-20">
        {summary}
        {/* Desktop: section list, current item marked by a Cobalt left rule. */}
        <nav aria-label="Profile sections" className="hidden lg:block">
          <ul className="flex flex-col">
            {PROFILE_SECTIONS.map((section) => {
              const isCurrent = current === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${sectionElementId(section.id)}`}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={cn(
                      'flex items-center justify-between gap-3 border-l-2 py-2 pl-3 text-[15px]',
                      isCurrent
                        ? 'border-primary text-primary font-semibold'
                        : 'hover:border-border border-transparent',
                    )}
                  >
                    <span>{section.label}</span>
                    <MissingState count={missing[section.id]} />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Phones: tabs, one section at a time. */}
        <div
          id={TABS_ID}
          role="tablist"
          aria-label="Profile sections"
          className="border-border grid scroll-mt-16 grid-cols-3 border-b lg:hidden"
        >
          {PROFILE_SECTIONS.map((section) => {
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={sectionElementId(section.id)}
                onClick={() => showSection(section.id)}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 border-b-2 px-1 pb-2 text-[15px]',
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'text-muted-foreground border-transparent',
                )}
              >
                <span>{section.label}</span>
                <MissingState count={missing[section.id]} />
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex flex-col gap-6 lg:gap-10">
        {PROFILE_SECTIONS.map((section) => {
          const next = nextSection(section.id);
          return (
            <section
              key={section.id}
              id={sectionElementId(section.id)}
              aria-labelledby={`${sectionElementId(section.id)}-heading`}
              className={cn(
                'flex scroll-mt-20 flex-col gap-4',
                active !== section.id && 'hidden lg:flex',
              )}
            >
              {sections[section.id]}
              {next ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full lg:hidden"
                  onClick={() => showSection(next.id)}
                >
                  Next: {next.label}
                </Button>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
