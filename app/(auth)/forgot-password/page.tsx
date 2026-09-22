import type { Metadata } from 'next';
import { getPublicEnv } from '@/lib/env';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  const { NEXT_PUBLIC_TURNSTILE_SITE_KEY } = getPublicEnv();
  return <ForgotPasswordForm turnstileSiteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY} />;
}
