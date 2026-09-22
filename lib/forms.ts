import { z } from 'zod';

// Shared shape for the auth server actions + useActionState forms.

export interface FormState {
  ok: boolean;
  /** Form-level error, already student-friendly. */
  error?: string;
  /** Per-field errors keyed by input name. */
  fieldErrors?: Record<string, string>;
  /** Success copy for flows that do not redirect (e.g. "check your email"). */
  message?: string;
  /** Increments on every submit; forms use it to reset the CAPTCHA widget. */
  attempt: number;
  /** Non-secret values echoed back so a failed submit does not clear the form (React 19 resets it). */
  values?: Record<string, string>;
}

export const INITIAL_FORM_STATE: FormState = { ok: false, attempt: 0 };

export const CAPTCHA_FIELD_NAME = 'cf-turnstile-response';

/** First message per field from a Zod error. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(flattened).flatMap(([field, messages]) =>
      messages?.[0] ? [[field, messages[0]]] : [],
    ),
  );
}

/** Reads the Turnstile token the widget injects as a hidden input. */
export function captchaTokenFrom(formData: FormData): string | undefined {
  const value = formData.get(CAPTCHA_FIELD_NAME);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Picks string fields from FormData to echo back after a failed submit. Never pass passwords. */
export function echoValues(formData: FormData, names: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    names.flatMap((name) => {
      const value = formData.get(name);
      return typeof value === 'string' ? [[name, value]] : [];
    }),
  );
}
