import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { COMPLETENESS_THRESHOLD } from '@/lib/constants';
import type { CompletenessResult } from '@/lib/profile/completeness';

interface CompletenessBarProps {
  result: CompletenessResult;
}

const MAX_LISTED_MISSING = 4;

export function CompletenessBar({ result }: CompletenessBarProps) {
  const listed = result.missing.slice(0, MAX_LISTED_MISSING);
  const extra = result.missing.length - listed.length;

  return (
    <div className="flex flex-col gap-2">
      <Progress value={result.score}>
        <ProgressLabel>Profile completeness</ProgressLabel>
        <ProgressValue />
      </Progress>
      {result.isReady ? (
        <p className="text-muted-foreground text-[15px]">Ready to generate drafts.</p>
      ) : (
        <p className="text-muted-foreground text-[15px]">
          Reach {COMPLETENESS_THRESHOLD}% to unlock drafts. Missing: {listed.join(', ')}
          {extra > 0 ? ` and ${extra} more` : ''}.
        </p>
      )}
    </div>
  );
}
