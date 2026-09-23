'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/actions/auth';
import { FormField } from '@/components/form/form-field';
import { FormMessage } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { INITIAL_FORM_STATE } from '@/lib/forms';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/schemas';

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, INITIAL_FORM_STATE);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-[22px] leading-tight font-semibold">Choose a new password</h1>
        <p className="text-muted-foreground text-[15px]">
          At least {PASSWORD_MIN_LENGTH} characters.
        </p>
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
