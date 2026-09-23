import { AcceptsBadge, EmailTypeBadge, VerifiedBadge } from '@/components/professor/badges';
import type { ProfessorListItem } from '@/lib/data/professors';
import { cn } from 'cn';

// The record strip (DESIGN.md §3): three evidence slots in a fixed order on every record,
// including empty states, so a student learns where to look once.
export function RecordStrip({
  professor,
  className,
}: {
  professor: Pick<
    ProfessorListItem,
    'accepts_intl' | 'last_verified' | 'last_verified_on' | 'email_type' | 'has_email'
  >;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      <AcceptsBadge value={professor.accepts_intl} />
      <VerifiedBadge raw={professor.last_verified} parsed={professor.last_verified_on} />
      <EmailTypeBadge value={professor.email_type} hasEmail={professor.has_email} />
    </div>
  );
}
