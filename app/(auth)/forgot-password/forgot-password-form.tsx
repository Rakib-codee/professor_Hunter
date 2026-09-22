'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset } from '@/actions/auth';
import { CaptchaField } from '@/components/auth/captcha-field';
import { FormField } from '@/components/form/form-field';
import { FormMessage } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { INITIAL_FORM_STATE } from '@/lib/forms';

interface ForgotPasswordFormProps {
  turnstileSiteKey?: string;
}

export function ForgotPasswordForm({ turnstileSiteKey }: ForgotPasswordFormProps) {
  const [state, action] = useActionState(requestPasswordReset, INITIAL_FORM_STATE);

  return (
    // key: remount after each submit so echoed defaultValues apply and the CAPTCHA resets.
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we will send you a link to choose a new password.
        </p>
      </div>
      <FormMessage error={state.error} message={state.message} />
      {state.ok ? null : (
        <>
          <FormField
            name="email"
            defaultValue={state.values?.email}
            label="Email"
            type="email"
            autoComplete="email"
            required
            error={state.fieldErrors?.email}
          />
          <CaptchaField siteKey={turnstileSiteKey} resetKey={state.attempt} />
          <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
        </>
      )}
      <p className="text-muted-foreground text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
