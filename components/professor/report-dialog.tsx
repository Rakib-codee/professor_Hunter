'use client';

import { useState, useTransition } from 'react';
import { submitReport } from '@/actions/professors';
import { NativeSelect } from '@/components/form/native-select';
import { TextareaField } from '@/components/form/textarea-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const REPORT_OPTIONS = [
  { value: 'wrong_email', label: 'Email is wrong' },
  { value: 'bounced', label: 'My email bounced' },
  { value: 'moved', label: 'Professor moved or retired' },
  { value: 'not_accepting', label: 'Not accepting students' },
  { value: 'other', label: 'Something else' },
];

interface ReportDialogProps {
  professorId: string;
  isSignedIn: boolean;
}

export function ReportDialog({ professorId, isSignedIn }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isSignedIn) return null;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      setError(null);
      const result = await submitReport({
        professorId,
        type: String(formData.get('type') ?? ''),
        message: String(formData.get('message') ?? ''),
      });
      if (result.ok) setDone(true);
      else setError(result.error ?? 'Something went wrong.');
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Report a problem</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a problem</DialogTitle>
          <DialogDescription>Helps us keep the list accurate for everyone.</DialogDescription>
        </DialogHeader>
        {done ? (
          <p className="text-sm">Thanks. We will check this professor’s details.</p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <NativeSelect
              name="type"
              label="What is wrong?"
              options={REPORT_OPTIONS}
              placeholder="Choose"
              required
            />
            <TextareaField name="message" label="Details (optional)" rows={3} maxLength={500} />
            {error ? (
              <p role="alert" className="text-destructive text-xs">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send report'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
