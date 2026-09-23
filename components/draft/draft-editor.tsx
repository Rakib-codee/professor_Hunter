'use client';

import { CheckIcon, CopyIcon, MailIcon, RefreshCwIcon, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { markSent } from '@/actions/drafts';
import { TextareaField } from '@/components/form/textarea-field';
import { EmailReveal } from '@/components/professor/email-reveal';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { buildMailto } from '@/lib/draft/mailto';
import {
  DRAFT_ERROR_COPY,
  WHY_LINE_MAX,
  type DraftFailure,
  type DraftQuota,
  type DraftSuccess,
} from '@/lib/draft/api-schema';
import type { Tone } from '@/lib/llm/types';
import { cn } from 'cn';

interface DraftEditorProps {
  professorId: string;
  professorName: string;
  hasEmail: boolean;
  initialQuota: DraftQuota;
}

type Phase = 'idle' | 'generating' | 'editing' | 'sent';

const WARNING_COPY: Record<string, string> = {
  research_reference_missing:
    'The draft may not mention the professor’s research clearly. Add one specific sentence.',
  too_long: 'The draft runs long. Trim it before sending.',
  placeholder: 'Replace any text in [square brackets] before sending.',
  emoji: 'Remove emoji before sending.',
};

export function DraftEditor({
  professorId,
  professorName,
  hasEmail,
  initialQuota,
}: DraftEditorProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [tone, setTone] = useState<Tone>('formal');
  const [whyLine, setWhyLine] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [quota, setQuota] = useState<DraftQuota>(initialQuota);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [outreachId, setOutreachId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const quotaLeft = quota.quota - quota.used;

  async function generate(nextTone: Tone) {
    setPhase('generating');
    setError(null);
    setConfirmRegenerate(false);
    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professorId, tone: nextTone, whyLine: whyLine.trim() || undefined }),
      });
      const payload = (await response.json()) as DraftSuccess | DraftFailure;
      if (!response.ok || 'error' in payload) {
        const failure = payload as DraftFailure;
        setError(failure.message ?? DRAFT_ERROR_COPY.generation_failed);
        if (failure.quota) setQuota(failure.quota);
        setPhase(draftId ? 'editing' : 'idle');
        return;
      }
      setSubject(payload.subject);
      setBody(payload.body);
      setDraftId(payload.draftId);
      setWarnings(payload.warnings);
      setQuota(payload.quota);
      setPhase('editing');
    } catch {
      setError(DRAFT_ERROR_COPY.generation_failed);
      setPhase(draftId ? 'editing' : 'idle');
    }
  }

  const onToneChange = (nextTone: Tone) => {
    setTone(nextTone);
    if (phase === 'editing') void generate(nextTone);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sent = () =>
    startTransition(async () => {
      if (!draftId) return;
      setError(null);
      const result = await markSent({ draftId, professorId, subject, body });
      if (result.ok && result.outreachId) {
        setOutreachId(result.outreachId);
        setPhase('sent');
      } else {
        setError(result.error ?? 'Could not save.');
      }
    });

  if (phase === 'sent') {
    return (
      <div className="enter border-border flex flex-col gap-3 rounded-sm border p-4" role="status">
        <p className="font-medium">
          Marked as sent. Follow-up reminder set for 10 days from today.
        </p>
        <p className="text-muted-foreground text-base">
          Track the reply and add notes in your tracker.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/tracker" className={buttonVariants()}>
            Open tracker
          </Link>
          <Link
            href={`/professor/${professorId}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to {professorName}
          </Link>
        </div>
        {outreachId ? <span className="sr-only">Outreach {outreachId}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <fieldset
            className="border-input inline-flex overflow-hidden rounded-sm border"
            aria-label="Tone"
          >
            {(['formal', 'concise'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={tone === option}
                onClick={() => onToneChange(option)}
                disabled={phase === 'generating'}
                className="aria-pressed:bg-primary aria-pressed:text-primary-foreground hover:bg-muted aria-pressed:hover:bg-primary h-10 px-4 text-[15px] font-medium transition-colors disabled:opacity-50"
              >
                {option === 'formal' ? 'Formal' : 'Concise'}
              </button>
            ))}
          </fieldset>
          <p className="text-muted-foreground tnum text-[13px]" aria-live="polite">
            {quota.used} of {quota.quota} drafts today
          </p>
        </div>
        <TextareaField
          name="whyLine"
          label="Why this professor? (optional, one line)"
          hint="e.g. Their 2024 paper on soil creep matches my thesis topic."
          rows={2}
          maxLength={WHY_LINE_MAX}
          value={whyLine}
          onChange={(event) => setWhyLine(event.target.value)}
          disabled={phase === 'generating'}
        />
        {phase === 'idle' || phase === 'generating' ? (
          <Button
            type="button"
            size="lg"
            className="sm:self-start"
            onClick={() => void generate(tone)}
            disabled={phase === 'generating' || quotaLeft <= 0}
          >
            <span className={cn(phase === 'generating' && 'busy-pulse')}>
              {phase === 'generating' ? 'Writing…' : 'Generate draft'}
            </span>
          </Button>
        ) : confirmRegenerate ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void generate(tone)}
              disabled={quotaLeft <= 0}
            >
              <RefreshCwIcon /> Yes, regenerate (uses 1 draft, discards edits)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRegenerate(false)}
            >
              Keep this one
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmRegenerate(true)}
            disabled={quotaLeft <= 0}
          >
            <RefreshCwIcon /> Regenerate
          </Button>
        )}
        {error ? (
          <p role="alert" className="text-destructive text-[15px]">
            {error}
          </p>
        ) : null}
      </section>

      {phase === 'editing' ? (
        <section className="enter flex flex-col gap-4">
          {warnings.length > 0 ? (
            <div
              role="alert"
              className="border-muted-foreground flex flex-col gap-1 rounded-sm border px-3 py-2 text-[15px]"
            >
              {warnings.map((warning) => (
                <p key={warning}>
                  {WARNING_COPY[warning] ?? 'Check the draft carefully before sending.'}
                </p>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draft-subject">Subject</Label>
            <Input
              id="draft-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={200}
              className="bg-muted"
            />
          </div>
          <TextareaField
            name="body"
            label="Email body"
            rows={14}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="text-base leading-relaxed"
          />
          <p className="text-muted-foreground text-[13px]">
            Edit before sending — professors recognise template emails.
          </p>

          <div className="border-border flex flex-col gap-3 rounded-sm border p-4">
            <h2 className="text-[15px] font-semibold">Send it</h2>
            <EmailReveal
              professorId={professorId}
              hasEmail={hasEmail}
              isSignedIn
              onReveal={setEmail}
            />
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button type="button" variant="outline" onClick={() => void copy()}>
                {copied ? <CheckIcon /> : <CopyIcon />} {copied ? 'Copied' : 'Copy subject + body'}
              </Button>
              {email ? (
                <a
                  href={buildMailto(email, subject, body)}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  <MailIcon /> Open in mail app
                </a>
              ) : null}
              <Button type="button" onClick={sent} disabled={pending || !draftId}>
                <SendIcon /> {pending ? 'Saving…' : 'I sent this'}
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
