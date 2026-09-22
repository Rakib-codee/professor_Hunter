'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/actions/auth';
import { FormField } from '@/components/auth/form-field';
import { FormMessage } from '@/components/auth/form-message';
import { SubmitButton } from '@/components/auth/submit-button';
import { INITIAL_AUTH_STATE } from '@/lib/auth/form';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/schemas';

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, INITIAL_AUTH_STATE);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <p className="text-muted-foreground text-sm">At least {PASSWORD_MIN_LENGTH} characters.</p>
      </div>
      <FormMessage error={state.error} />
      <FormField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
        error={state.fieldErrors?.password}
      />
      <FormField
        name="confirm"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm}
      />
      <SubmitButton pendingText="Saving…">Save password</SubmitButton>
    </form>
  );
}
