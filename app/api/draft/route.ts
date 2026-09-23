import { NextResponse, type NextRequest } from 'next/server';
import { COMPLETENESS_THRESHOLD } from '@/lib/constants';
import { getProfessor } from '@/lib/data/professors';
import { getCurrentStudent } from '@/lib/data/students';
import {
  DRAFT_ERROR_COPY,
  draftRequestSchema,
  type DraftErrorCode,
  type DraftFailure,
  type DraftQuota,
  type DraftSuccess,
} from '@/lib/draft/api-schema';
import { getServerEnv } from '@/lib/env';
import { toProfessorFacts, toStudentFacts } from '@/lib/llm/facts';
import { buildSubject } from '@/lib/llm/prompt';
import { generateWithFallback, resolveProviders } from '@/lib/llm/provider';
import type { DraftInput } from '@/lib/llm/types';
import { validateDraft } from '@/lib/llm/validate';
import { computeCompleteness } from '@/lib/profile/completeness';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// POST /api/draft (PLAN.md §8). Quota is consumed before the model call and refunded when
// generation fails. Professor email never enters this route.

export const maxDuration = 60;

const RETRY_HINTS: Record<string, string> = {
  too_long: 'the body was too long',
  emoji: 'it contained emoji',
  research_reference_missing: "it did not reference the professor's research area",
  placeholder: 'it contained placeholders in square brackets',
  empty: 'the body was empty',
};

function failure(code: DraftErrorCode, status: number, quota?: DraftQuota) {
  const body: DraftFailure = { error: code, message: DRAFT_ERROR_COPY[code], quota };
  return NextResponse.json(body, { status });
}

async function refundQuota(studentId: string, professorId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('usage_log')
    .select('id')
    .eq('student_id', studentId)
    .eq('professor_id', professorId)
    .eq('action', 'generate_draft')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) await admin.from('usage_log').delete().eq('id', data.id);
}

export async function POST(request: NextRequest) {
  const student = await getCurrentStudent();
  if (!student) return failure('unauthorized', 401);
  if (computeCompleteness(student).score < COMPLETENESS_THRESHOLD)
    return failure('profile_incomplete', 403);

  const parsed = draftRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure('invalid_request', 400);
  const { professorId, tone, whyLine } = parsed.data;

  const providers = (() => {
    try {
      return resolveProviders(getServerEnv());
    } catch (error) {
      console.error(
        `[draft] provider config: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  })();
  if (providers.length === 0) return failure('drafts_disabled', 503);

  const professor = await getProfessor(professorId);
  if (!professor) return failure('professor_not_found', 404);

  const admin = createAdminClient();
  const { data: quotaRows, error: quotaError } = await admin.rpc('consume_draft_quota', {
    p_student_id: student.id,
    p_professor_id: professorId,
  });
  const quotaRow = quotaRows?.[0];
  if (quotaError || !quotaRow) {
    console.error(`[draft] quota rpc failed code=${quotaError?.code ?? 'none'}`);
    return failure('generation_failed', 502);
  }
  const quota: DraftQuota = { used: quotaRow.used, quota: quotaRow.quota };
  if (!quotaRow.allowed) return failure('daily_limit', 429, quota);

  const input: DraftInput = {
    student: toStudentFacts(student),
    professor: toProfessorFacts(professor),
    tone,
    whyLine,
  };
  const warnings: string[] = [];
  let output;
  try {
    const first = await generateWithFallback(providers, input);
    const check = validateDraft(first.output.body, tone, professor.research_area);
    if (check.ok) {
      output = first.output;
    } else {
      const hint = check.issues.map((issue) => RETRY_HINTS[issue] ?? issue).join('; ');
      const second = await generateWithFallback(providers, { ...input, retryHint: hint });
      const recheck = validateDraft(second.output.body, tone, professor.research_area);
      output =
        recheck.ok || recheck.issues.length <= check.issues.length ? second.output : first.output;
      if (!recheck.ok) warnings.push(...(recheck.ok ? [] : recheck.issues));
    }
  } catch (error) {
    console.error(
      `[draft] generation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    await refundQuota(student.id, professorId);
    return failure('generation_failed', 502, {
      used: Math.max(0, quota.used - 1),
      quota: quota.quota,
    });
  }

  const subject = buildSubject(input);
  const supabase = await createClient();
  const { data: draft, error: insertError } = await supabase
    .from('drafts')
    .insert({
      student_id: student.id,
      professor_id: professorId,
      subject,
      body: output.body,
      tone,
      model: output.model,
      prompt_tokens: output.promptTokens ?? null,
      completion_tokens: output.completionTokens ?? null,
    })
    .select('id')
    .single();
  if (insertError || !draft) {
    console.error(`[draft] insert failed code=${insertError?.code ?? 'none'}`);
    return failure('generation_failed', 500, quota);
  }

  const success: DraftSuccess = {
    draftId: draft.id,
    subject,
    body: output.body,
    model: output.model,
    warnings,
    quota,
  };
  return NextResponse.json(success);
}
