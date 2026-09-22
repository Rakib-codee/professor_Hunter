import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';
import {
  acceptsLabel,
  emailTypeLabel,
  verifiedLabel,
  type AcceptsIntl,
  type EmailType,
} from '@/lib/utils/display';

// Badge copy is fixed in PLAN.md §6. "unknown" is never green.

const TONE_CLASS = {
  positive: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  neutral: 'bg-muted text-muted-foreground',
  negative: 'bg-destructive/10 text-destructive',
} as const;

export function AcceptsBadge({ value }: { value: AcceptsIntl | null }) {
  const { text, tone } = acceptsLabel(value);
  return <Badge className={TONE_CLASS[tone]}>{text}</Badge>;
}

export function VerifiedBadge({ raw, parsed }: { raw: string | null; parsed: string | null }) {
  const { text, isStale } = verifiedLabel(raw, parsed);
  return (
    <Badge
      variant="outline"
      className={cn(isStale && 'text-muted-foreground border-dashed')}
      title={isStale ? 'Verified over a year ago' : undefined}
    >
      {text}
      {isStale ? ' · stale' : ''}
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
  return (
    <Badge
      variant={hasEmail ? 'secondary' : 'outline'}
      className={cn(!hasEmail && 'text-muted-foreground')}
    >
      {text}
    </Badge>
  );
}
