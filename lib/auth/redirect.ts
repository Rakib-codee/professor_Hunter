import { isAuthPage } from './routes';

// `?next=` handling. Only same-origin paths are allowed, so a crafted login link cannot
// bounce a student to another site after they sign in.

const CALLBACK_PREFIX = '/auth/';

export function safeNextPath(candidate: string | null | undefined, fallback: string): string {
  if (!candidate) return fallback;
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;
  const pathname = candidate.split(/[?#]/, 1)[0] ?? '';
  if (isAuthPage(pathname) || pathname.startsWith(CALLBACK_PREFIX)) return fallback;
  return candidate;
}
