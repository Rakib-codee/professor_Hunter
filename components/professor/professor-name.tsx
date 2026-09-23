import { cn } from 'cn';

// Latin name in the UI font, Chinese name in the system CJK stack with the right language tag
// (DESIGN.md §2). displayName() is still used wherever a plain string is needed (titles, mailto).
export function ProfessorName({
  nameEn,
  nameCn,
  className,
}: {
  nameEn: string;
  nameCn: string | null;
  className?: string;
}) {
  const cn_ = nameCn?.trim();
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-[0.4em]', className)}>
      <span>{nameEn}</span>
      {cn_ ? (
        // Size and weight come from the parent: body text steps the CJK up (globals :lang rule),
        // display type steps it down to 0.9em (font-display utility).
        <span lang="zh-Hans" className="text-muted-foreground">
          {cn_}
        </span>
      ) : null}
    </span>
  );
}
