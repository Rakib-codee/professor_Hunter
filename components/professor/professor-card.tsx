import Link from 'next/link';
import type { ProfessorListItem } from '@/lib/data/professors';
import { ProfessorName } from './professor-name';
import { RecordStrip } from './record-strip';
import { SaveButton } from './save-button';
import { TagChips } from './tag-chips';

interface ProfessorCardProps {
  professor: ProfessorListItem;
  saved: boolean;
  isSignedIn: boolean;
}

// One record in the ledger (DESIGN.md §3): no box, hairline rules come from the parent list.
// Order is fixed: name, title, university then school, research area, tags, record strip.
export function ProfessorCard({ professor, saved, isSignedIn }: ProfessorCardProps) {
  return (
    <article className="relative flex flex-col gap-2 py-5 pr-12">
      <h3 className="font-display text-[20px] leading-[1.2] md:text-[22px]">
        <Link
          href={`/professor/${professor.id}`}
          className="hover:text-primary underline-offset-4 hover:underline"
        >
          <ProfessorName nameEn={professor.name_en} nameCn={professor.name_cn} />
        </Link>
      </h3>
      {professor.title ? (
        <p className="text-muted-foreground -mt-1 text-[15px]">{professor.title}</p>
      ) : null}
      {professor.university_name || professor.school ? (
        <p className="text-[15px] leading-snug">
          {professor.university_name ? <span>{professor.university_name}</span> : null}
          {professor.university_name && professor.school ? <br /> : null}
          {professor.school ? (
            <span className="text-muted-foreground">{professor.school}</span>
          ) : null}
        </p>
      ) : null}
      <div className="absolute top-3 right-0">
        <SaveButton professorId={professor.id} saved={saved} isSignedIn={isSignedIn} />
      </div>
      {professor.research_area ? (
        <p className="line-clamp-2 text-base">{professor.research_area}</p>
      ) : null}
      <TagChips tags={professor.research_tags} />
      <RecordStrip professor={professor} className="mt-1" />
    </article>
  );
}
