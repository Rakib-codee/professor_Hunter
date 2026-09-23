import { z } from 'zod';

// Shared contract for POST /api/draft (server validates, client types responses).

export const WHY_LINE_MAX = 200;

export const draftRequestSchema = z.object({
  professorId: z.uuid(),
  tone: z.enum(['formal', 'concise']),
  whyLine: z.string().trim().max(WHY_LINE_MAX).optional(),
});
export type DraftRequest = z.infer<typeof draftRequestSchema>;

export interface DraftQuota {
  used: number;
  quota: number;
}

export interface DraftSuccess {
  draftId: string;
  subject: string;
  body: string;
  model: string;
  warnings: string[];
  quota: DraftQuota;
}

export type DraftErrorCode =
  | 'unauthorized'
  | 'profile_incomplete'
  | 'invalid_request'
  | 'professor_not_found'
  | 'daily_limit'
  | 'drafts_disabled'
  | 'generation_failed';

export interface DraftFailure {
  error: DraftErrorCode;
  message: string;
  quota?: DraftQuota;
}

export const DRAFT_ERROR_COPY: Record<DraftErrorCode, string> = {
  unauthorized: 'Please log in to generate a draft.',
  profile_incomplete: 'Complete your profile to 70% first.',
  invalid_request: 'That request was not valid. Reload the page and try again.',
  professor_not_found: 'This professor is no longer listed.',
  daily_limit: 'You have used all of today’s drafts. The limit resets at midnight UTC.',
  drafts_disabled: 'Draft generation is coming in a few days.',
  generation_failed: 'The writing service did not respond. Please try again in a minute.',
};
