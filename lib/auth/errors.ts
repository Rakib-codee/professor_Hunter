// Maps Supabase Auth error codes to copy a student can act on. Raw messages are never
// shown: they can leak implementation detail and are not written for end users.

const GENERIC_MESSAGE = 'Something went wrong. Please try again in a moment.';

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is incorrect.',
  email_address_invalid:
    'That email address is not accepted. Use a real, personal or university address.',
  user_already_exists: 'An account with this email already exists. Try logging in instead.',
  email_exists: 'An account with this email already exists. Try logging in instead.',
  weak_password: 'Please choose a stronger password.',
  same_password: 'Choose a password different from your current one.',
  over_request_rate_limit: 'Too many attempts. Please wait a few minutes and try again.',
  over_email_send_rate_limit: 'Too many emails sent. Please wait a few minutes and try again.',
  captcha_failed: 'Verification failed. Please complete the CAPTCHA and try again.',
  session_expired: 'Your session has expired. Please log in again.',
  email_not_confirmed: 'Please confirm your email address before logging in.',
  validation_failed: 'Please check the form and try again.',
  signup_disabled: 'Sign-ups are currently closed.',
};

export interface AuthErrorLike {
  code?: string | null;
  message: string;
}

export function friendlyAuthError(error: AuthErrorLike | null | undefined): string {
  if (!error?.code) return GENERIC_MESSAGE;
  return MESSAGES[error.code] ?? GENERIC_MESSAGE;
}
