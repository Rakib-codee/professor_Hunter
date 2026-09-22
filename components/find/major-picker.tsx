import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MAJORS } from '@/lib/constants';
import type { MajorCount } from '@/lib/data/professors';

interface MajorPickerProps {
  counts: Record<string, MajorCount>;
  /** Field from the student's profile, shown first. */
  preferredField: string | null;
}

export function MajorPicker({ counts, preferredField }: MajorPickerProps) {
  const ordered = [...MAJORS].sort((a, b) =>
    a.field === preferredField ? -1 : b.field === preferredField ? 1 : 0,
  );
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ordered.map((major) => {
        const count = counts[major.field];
        return (
          <Link key={major.slug} href={`/find/${major.slug}`} className="block">
            <Card className="hover:bg-muted/50 h-full transition-colors">
              <CardHeader>
                <CardTitle>{major.field}</CardTitle>
                <CardDescription>
                  {count
                    ? `${count.professors} professors · ${count.universities} universities`
                    : 'No professors yet'}
                  {major.field === preferredField ? ' · your field' : ''}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
