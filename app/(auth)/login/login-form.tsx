'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn } from '@/actions/auth';
import { CaptchaField } from '@/components/auth/captcha-field';
import { FormField } from '@/components/form/form-field';
import { FormMessage } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { INITIAL_FORM_STATE } from '@/lib/forms';

interface LoginFormProps {
  next: string;
  initialError?: string;
  turnstileSiteKey?: string;
}

export function LoginForm({ next, initialError, turnstileSiteKey }: LoginFormProps) {
  const [state, action] = useActionState(signIn, INITIAL_FORM_STATE);
  const error = state.error ?? (state.attempt === 0 ? initialError : undefined);

  return (
    // key: remount after each submit so echoed defaultValues apply and the CAPTCHA resets.
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold">Log in</h1>
        <p className="text-muted-foreground text-sm">Welcome back.</p>
      </div>
      <FormMessage error={error} />
      <input type="hidden" name="next" value={next} />
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
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <CaptchaField siteKey={turnstileSiteKey} resetKey={state.attempt} />
      <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
      <div className="text-muted-foreground flex flex-col gap-1 text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot your password?
        </Link>
        <span>
          New here?{' '}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="text-primary hover:underline"
          >
            Create an account
          </Link>
        </span>
      </div>
    </form>
  );
}
