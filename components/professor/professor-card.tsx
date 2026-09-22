import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProfessorListItem } from '@/lib/data/professors';
import { displayName } from '@/lib/utils/display';
import { AcceptsBadge, EmailTypeBadge, VerifiedBadge } from './badges';
import { SaveButton } from './save-button';
import { TagChips } from './tag-chips';

interface ProfessorCardProps {
  professor: ProfessorListItem;
  saved: boolean;
  isSignedIn: boolean;
}

export function ProfessorCard({ professor, saved, isSignedIn }: ProfessorCardProps) {
  const affiliation = [professor.university_name, professor.school].filter(Boolean).join(' · ');
  return (
    <Card size="sm" className="relative">
      <CardHeader className="pr-12">
        <CardTitle>
          <Link href={`/professor/${professor.id}`} className="hover:underline">
            {displayName(professor.name_en, professor.name_cn)}
          </Link>
        </CardTitle>
        {professor.title ? (
          <p className="text-muted-foreground text-xs">{professor.title}</p>
        ) : null}
        {affiliation ? <p className="text-xs">{affiliation}</p> : null}
        <div className="absolute top-2 right-2">
          <SaveButton professorId={professor.id} saved={saved} isSignedIn={isSignedIn} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {professor.research_area ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">{professor.research_area}</p>
        ) : null}
        <TagChips tags={professor.research_tags} />
        <div className="flex flex-wrap gap-1.5">
          <AcceptsBadge value={professor.accepts_intl} />
          <VerifiedBadge raw={professor.last_verified} parsed={professor.last_verified_on} />
          <EmailTypeBadge value={professor.email_type} hasEmail={professor.has_email} />
        </div>
      </CardContent>
    </Card>
  );
}
