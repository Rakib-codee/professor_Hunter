import { Fragment } from 'react';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { COMPLETENESS_THRESHOLD } from '@/lib/constants';
import type { CompletenessResult } from '@/lib/profile/completeness';

interface CompletenessBarProps {
  result: CompletenessResult;
  /** Prefix for the field links: '' on the profile page itself, '/profile' elsewhere. */
  fieldHrefBase?: string;
}

// The bar plus every missing item by name, each a link straight to its input.
export function CompletenessBar({ result, fieldHrefBase = '' }: CompletenessBarProps) {
  const items = result.missingItems;
  const lastIndex = items.length - 1;

  return (
    <div className="flex flex-col gap-2">
      <Progress value={result.score}>
        <ProgressLabel>Profile completeness</ProgressLabel>
        <ProgressValue />
      </Progress>
      <p className="text-muted-foreground text-[15px]">
        {result.isReady
          ? 'Ready to generate drafts.'
          : `Reach ${COMPLETENESS_THRESHOLD}% to unlock drafts.`}
        {items.length > 0 ? (
          <>
            {' '}
            Missing:{' '}
            {items.map((item, index) => (
              <Fragment key={item.field}>
                <a
                  href={`${fieldHrefBase}#${item.field}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {item.label}
                </a>
                {index < lastIndex ? ', ' : '.'}
              </Fragment>
            ))}
          </>
        ) : null}
      </p>
    </div>
  );
}
