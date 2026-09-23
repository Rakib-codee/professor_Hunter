import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { MAJORS } from '@/lib/constants';
import type { MajorCount } from '@/lib/data/professors';

interface MajorPickerProps {
  counts: Record<string, MajorCount>;
  /** Field from the student's profile, shown first. */
  preferredField: string | null;
}

// Majors as a ledger (DESIGN.md §3): full-width rows, counts on the right, hairline rules.
export function MajorPicker({ counts, preferredField }: MajorPickerProps) {
  const ordered = [...MAJORS].sort((a, b) =>
    a.field === preferredField ? -1 : b.field === preferredField ? 1 : 0,
  );
  return (
    <ul className="ledger border-border border-y">
      {ordered.map((major) => {
        const count = counts[major.field];
        const isPreferred = major.field === preferredField;
        return (
          <li key={major.slug}>
            <Link
              href={`/find/${major.slug}`}
              className="hover:bg-muted focus-visible:bg-muted flex min-h-[72px] items-baseline justify-between gap-4 py-4 pr-1 pl-1 transition-colors md:min-h-[88px]"
            >
              <span className="flex flex-col gap-1">
                <span className="font-display text-[24px] leading-[1.15] md:text-[28px] md:leading-[1.1]">
                  {major.field}
                </span>
                {isPreferred ? (
                  <span className="text-primary text-[13px] font-medium">your field</span>
                ) : null}
              </span>
              <span className="flex shrink-0 items-baseline gap-2 text-right">
                {count ? (
                  <>
                    <span className="display-figure text-[22px] md:text-[28px]">
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
