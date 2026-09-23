import { Building2Icon, CalendarDaysIcon, CheckIcon, MailXIcon, UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';
import {
  acceptsLabel,
  emailTypeLabel,
  verifiedLabel,
  type AcceptsIntl,
  type EmailType,
  type Tone,
} from '@/lib/utils/display';

// Badge copy is fixed in PLAN.md §6. Treatment follows DESIGN.md §1: acceptance is the only
// badge that carries colour, and each evidence level has its own family. Verification and email
// type are provenance, never green.

const TONE_CLASS: Record<Tone, string> = {
  positive: 'bg-confirmed text-confirmed-foreground border-confirmed',
  caution: 'bg-caution text-caution-foreground border-caution-foreground',
  neutral: 'bg-muted text-muted-foreground border-muted-foreground',
  negative: 'bg-negative text-negative-foreground border-negative-foreground',
};

export function AcceptsBadge({ value }: { value: AcceptsIntl | null }) {
  const { text, tone } = acceptsLabel(value);
  return (
    <Badge className={TONE_CLASS[tone]}>
      {tone === 'positive' ? <CheckIcon aria-hidden="true" /> : null}
      {text}
    </Badge>
  );
}

export function VerifiedBadge({ raw, parsed }: { raw: string | null; parsed: string | null }) {
  const { text, isStale } = verifiedLabel(raw, parsed);
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-muted-foreground tnum border-transparent px-0',
        isStale && 'border-border border-dashed px-2',
      )}
      title={isStale ? 'Verified over a year ago' : undefined}
    >
      <CalendarDaysIcon aria-hidden="true" />
      {text}
      {isStale ? ' (may be outdated)' : ''}
    </Badge>
  );
}

export function EmailTypeBadge({
  value,
  hasEmail,
}: {
  value: EmailType | null;
  hasEmail: boolean;
}) {
  const text = hasEmail ? emailTypeLabel(value) : emailTypeLabel('none');
  const Icon = !hasEmail ? MailXIcon : value === 'university' ? Building2Icon : UserIcon;
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-muted-foreground border-transparent px-0',
        !hasEmail && 'bg-muted border-border border-dashed px-2',
      )}
    >
      <Icon aria-hidden="true" />
      {text}
    </Badge>
  );
}
