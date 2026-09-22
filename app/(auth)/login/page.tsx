import type { Metadata } from 'next';
import { safeNextPath } from '@/lib/auth/redirect';
import { getPublicEnv } from '@/lib/env';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Log in' };

const LINK_ERRORS: Record<string, string> = {
  link_invalid: 'That link is invalid or has expired. Request a new one below.',
};

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const next = safeNextPath(firstValue(params.next), '/dashboard');
  const linkError = LINK_ERRORS[firstValue(params.error) ?? ''];
  const { NEXT_PUBLIC_TURNSTILE_SITE_KEY } = getPublicEnv();

  return (
    <LoginForm
      next={next}
      initialError={linkError}
      turnstileSiteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    />
  );
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
