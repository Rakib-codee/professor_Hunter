import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from 'cn';
import { MAJORS } from '@/lib/constants';
import type { MajorCount } from '@/lib/data/professors';

interface MajorPickerProps {
  counts: Record<string, MajorCount>;
  /** Field from the student's profile, shown first. */
  preferredField: string | null;
  /** Landing entrance: rows rise in sequence once on load (DESIGN.md §9). */
  enter?: boolean;
}

// Majors as a ledger and the landing page's dominant element (DESIGN.md §3, §7): one display line
// per row with its count on the same baseline, hairline rules, 84/104px rows.
export function MajorPicker({ counts, preferredField, enter = false }: MajorPickerProps) {
  const ordered = [...MAJORS].sort((a, b) =>
    a.field === preferredField ? -1 : b.field === preferredField ? 1 : 0,
  );
  return (
    <ul className={cn('ledger border-border border-y', enter && 'ledger-enter')}>
      {ordered.map((major) => {
        const count = counts[major.field];
        const isPreferred = major.field === preferredField;
        return (
          <li key={major.slug}>
            <Link
              href={`/find/${major.slug}`}
              className="hover:bg-muted focus-visible:bg-muted flex min-h-[84px] items-baseline justify-between gap-4 py-[18px] pr-1 pl-1 transition-colors md:min-h-[104px] md:py-[22px]"
            >
              <span className="flex flex-col gap-1">
                <span className="font-display text-[30px] leading-[1.05] md:text-[36px] md:leading-[1.05]">
                  {major.field}
                </span>
                {isPreferred ? (
                  <span className="text-primary text-[13px] font-medium">your field</span>
                ) : null}
              </span>
              <span className="flex shrink-0 items-baseline gap-2 text-right">
                {count ? (
                  <>
                    <span className="display-figure text-[30px] md:text-[36px]">
                      {count.professors}
                    </span>
                    <span className="text-muted-foreground text-[13px] md:text-[14px]">
                      professors
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-[15px]">No professors yet</span>
                )}
                <ChevronRightIcon
                  className="text-muted-foreground size-4 self-center"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
