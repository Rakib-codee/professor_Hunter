'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUp } from '@/actions/auth';
import { CaptchaField } from '@/components/auth/captcha-field';
import { FormField } from '@/components/auth/form-field';
import { FormMessage } from '@/components/auth/form-message';
import { SubmitButton } from '@/components/auth/submit-button';
import { INITIAL_AUTH_STATE } from '@/lib/auth/form';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/schemas';

interface SignupFormProps {
  next: string;
  turnstileSiteKey?: string;
}

export function SignupForm({ next, turnstileSiteKey }: SignupFormProps) {
  const [state, action] = useActionState(signUp, INITIAL_AUTH_STATE);

  return (
    // key: remount after each submit so echoed defaultValues apply and the CAPTCHA resets.
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-muted-foreground text-sm">
          Free. Save professors, generate drafts and track replies.
        </p>
      </div>
      <FormMessage error={state.error} message={state.message} />
      <input type="hidden" name="next" value={next} />
      <FormField
        name="fullName"
        defaultValue={state.values?.fullName}
        label="Full name"
        type="text"
        autoComplete="name"
        required
        error={state.fieldErrors?.fullName}
      />
      <FormField
        name="email"
        defaultValue={state.values?.email}
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
        placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
        error={state.fieldErrors?.password}
      />
      <CaptchaField siteKey={turnstileSiteKey} resetKey={state.attempt} />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      <p className="text-muted-foreground text-xs">
        By signing up you agree to the{' '}
        <Link href="/terms" className="underline">
          terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          privacy policy
        </Link>
        .
      </p>
      <p className="text-muted-foreground text-sm">
        Already have an account?{' '}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
