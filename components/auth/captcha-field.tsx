import { TurnstileWidget } from './turnstile-widget';

interface CaptchaFieldProps {
  siteKey: string | undefined;
  resetKey: number;
}

// Renders nothing when no site key is configured (Supabase CAPTCHA must then be off).
export function CaptchaField({ siteKey, resetKey }: CaptchaFieldProps) {
  if (!siteKey) return null;
  return <TurnstileWidget siteKey={siteKey} resetKey={resetKey} />;
}
