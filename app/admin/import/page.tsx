import type { Metadata } from 'next';
import { ImportForm } from '@/components/admin/import-form';

export const metadata: Metadata = { robots: { index: false } };
// The import runs inside the server action; allow a few minutes for a full dataset.
export const maxDuration = 300;

export default function AdminImportPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div>
        <h1 className="heading-page">Import professors</h1>
        <p className="text-muted-foreground text-[15px]">
          Idempotent: re-importing the same file changes nothing. Rows match on university + email,
          or university + name + field when the email is missing. Under 2 MB.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
