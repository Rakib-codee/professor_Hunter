'use server';

import { redirect } from 'next/navigation';
import type { z } from 'zod';
import { friendlyAuthError } from '@/lib/auth/errors';
import { captchaTokenFrom, echoValues, fieldErrorsFrom, type AuthFormState } from '@/lib/auth/form';
import { safeNextPath } from '@/lib/auth/redirect';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/auth/schemas';
import { getPublicEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

// Auth server actions. Every action re-validates with Zod, never echoes raw Supabase
// errors, and only redirects to same-origin paths. Email + password only (PLAN Q10).

const DEFAULT_AFTER_LOGIN = '/dashboard';
const RESET_PASSWORD_PATH = '/reset-password';
const CAPTCHA_MISSING = 'Please complete the verification challenge.';
const RESET_EMAIL_SENT =
  'If an account exists for that email, a password reset link is on its way. Check your inbox and spam folder.';
const CONFIRMATION_PENDING =
  'Account created. Check your email to confirm your address, then log in.';

function nextAttempt(prev: AuthFormState): number {
  return prev.attempt + 1;
}

function fail(prev: AuthFormState, error: string, values?: Record<string, string>): AuthFormState {
  return { ok: false, error, values, attempt: nextAttempt(prev) };
}

// Server-side detail for debugging. Code and status only — never the email or message body.
function logAuthError(action: string, error: { code?: string | null; status?: number }): void {
  console.error(`[auth.${action}] code=${error.code ?? 'none'} status=${error.status ?? 'none'}`);
}

function invalid(
  prev: AuthFormState,
  error: z.ZodError,
  values?: Record<string, string>,
): AuthFormState {
  return { ok: false, fieldErrors: fieldErrorsFrom(error), values, attempt: nextAttempt(prev) };
}

// When a site key is configured the widget renders, so a missing token means the student
// submitted before it finished. When it is not, Supabase CAPTCHA must be off and we send nothing.
function readCaptcha(formData: FormData): { token?: string; missing: boolean } {
  const token = captchaTokenFrom(formData);
  const required = Boolean(getPublicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  return { token, missing: required && !token };
}

export async function signUp(prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  const values = echoValues(formData, ['fullName', 'email']);
  if (!parsed.success) return invalid(prev, parsed.error, values);
  const captcha = readCaptcha(formData);
  if (captcha.missing) return fail(prev, CAPTCHA_MISSING, values);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, captchaToken: captcha.token },
  });
  if (error) {
    logAuthError('signUp', error);
    return fail(prev, friendlyAuthError(error), values);
  }

  // Email confirmation is OFF (PLAN Q8), so a session is expected. If the dashboard setting
  // ever flips, say so honestly instead of redirecting to a page that will bounce.
  if (!data.session) {
    return { ok: true, message: CONFIRMATION_PENDING, attempt: nextAttempt(prev) };
  }

  redirect(safeNextPath(formData.get('next')?.toString(), DEFAULT_AFTER_LOGIN));
}

export async function signIn(prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  const values = echoValues(formData, ['email']);
  if (!parsed.success) return invalid(prev, parsed.error, values);
  const captcha = readCaptcha(formData);
  if (captcha.missing) return fail(prev, CAPTCHA_MISSING, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { captchaToken: captcha.token },
  });
  if (error) {
    logAuthError('signIn', error);
    return fail(prev, friendlyAuthError(error), values);
  }

  redirect(safeNextPath(formData.get('next')?.toString(), DEFAULT_AFTER_LOGIN));
}

export async function requestPasswordReset(
  prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  const values = echoValues(formData, ['email']);
  if (!parsed.success) return invalid(prev, parsed.error, values);
  const captcha = readCaptcha(formData);
  if (captcha.missing) return fail(prev, CAPTCHA_MISSING, values);

  const env = getPublicEnv();
  const redirectTo = new URL('/auth/callback', env.NEXT_PUBLIC_SITE_URL);
  redirectTo.searchParams.set('next', RESET_PASSWORD_PATH);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: redirectTo.toString(),
    captchaToken: captcha.token,
  });

  // Rate-limit and CAPTCHA problems are actionable; anything else is hidden so the form
  // cannot be used to discover which emails have accounts.
  if (error) logAuthError('requestPasswordReset', error);
  if (error?.code === 'over_email_send_rate_limit' || error?.code === 'captcha_failed') {
    return fail(prev, friendlyAuthError(error), values);
  }
  return { ok: true, message: RESET_EMAIL_SENT, attempt: nextAttempt(prev) };
}

export async function updatePassword(
  prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  });
  if (!parsed.success) return invalid(prev, parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logAuthError('updatePassword', error);
    return fail(prev, friendlyAuthError(error));
  }

  redirect(DEFAULT_AFTER_LOGIN);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
