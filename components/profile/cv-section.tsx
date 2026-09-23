'use client';

import { useActionState } from 'react';
import { removeCv, uploadCv } from '@/actions/profile';
import { FormMessage } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { INITIAL_FORM_STATE } from '@/lib/forms';

interface CvSectionProps {
  /** Signed download link for the current CV, null when none is uploaded. */
  downloadUrl: string | null;
}

export function CvSection({ downloadUrl }: CvSectionProps) {
  const [state, action] = useActionState(uploadCv, INITIAL_FORM_STATE);

  return (
    <div className="flex flex-col gap-3">
      {downloadUrl ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Download current CV (PDF)
          </a>
          <form action={removeCv}>
            <Button type="submit" variant="ghost" size="xs">
              Remove
            </Button>
          </form>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No CV uploaded. Optional: not used by drafts yet.
        </p>
      )}
      <form
        key={`${state.attempt}-${downloadUrl ? 'has-cv' : 'no-cv'}`}
        action={action}
        className="flex flex-col gap-2"
        encType="multipart/form-data"
      >
        <Label htmlFor="cv-file">
          {downloadUrl ? 'Replace CV' : 'Upload CV'} (PDF, under 2 MB)
        </Label>
        <input
          id="cv-file"
          name="cv"
          type="file"
          accept="application/pdf,.pdf"
          required
          className="text-sm"
        />
        <FormMessage error={state.error} message={state.message} />
        <div>
          <SubmitButton pendingText="Uploading…">Upload</SubmitButton>
        </div>
      </form>
    </div>
  );
}
