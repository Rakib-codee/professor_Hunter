import type { Metadata } from 'next';
import { safeNextPath } from '@/lib/auth/redirect';
import { getPublicEnv } from '@/lib/env';
import { SignupForm } from './signup-form';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignupPage({ searchParams }: PageProps<'/signup'>) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextPath(rawNext, '/dashboard');
  const { NEXT_PUBLIC_TURNSTILE_SITE_KEY } = getPublicEnv();

  return <SignupForm next={next} turnstileSiteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY} />;
}
