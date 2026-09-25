// Section heading with the save confirmation beside it, so "Saved." is visible without
// scrolling to the button at the bottom of the form.
interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Success copy from the last submit, e.g. "Saved." */
  status?: string;
  headingId?: string;
}

export function SectionHeader({ title, description, status, headingId }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={headingId} className="heading-section">
          {title}
        </h2>
        {status ? (
          <span role="status" className="text-muted-foreground text-[15px]">
            {status}
          </span>
        ) : null}
      </div>
      {description ? <p className="text-muted-foreground text-[15px]">{description}</p> : null}
    </div>
  );
}
