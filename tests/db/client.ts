// Minimal PostgREST/GoTrue helpers for the DB security tests. Retries GET-like calls
// because this machine drops TLS connections intermittently.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const FIXTURE_EMAIL = process.env.E2E_EMAIL ?? 'professorhunter.help+authtest@outlook.com';
export const FIXTURE_PASSWORD = process.env.E2E_PASSWORD ?? '';

export const hasProject = Boolean(SUPABASE_URL && PUBLISHABLE_KEY);
export const hasFixture = hasProject && Boolean(FIXTURE_PASSWORD);

const RETRIES = 3;

export interface RestResult {
  status: number;
  body: unknown;
}

async function request(path: string, init: RequestInit): Promise<RestResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${SUPABASE_URL}${path}`, init);
      const text = await response.text();
      let body: unknown = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      return { status: response.status, body };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('request failed');
}

function headers(token: string): Record<string, string> {
  return {
    apikey: PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/** `select` from a table or view. `token` defaults to anon. */
export function select(table: string, query: string, token = PUBLISHABLE_KEY): Promise<RestResult> {
  return request(`/rest/v1/${table}?${query}`, { headers: headers(token) });
}

export function rpc(name: string, args: unknown, token = PUBLISHABLE_KEY): Promise<RestResult> {
  return request(`/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(args ?? {}),
  });
}

export function patch(
  table: string,
  query: string,
  data: unknown,
  token: string,
): Promise<RestResult> {
  return request(`/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: { ...headers(token), Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

/** Password sign-in for the fixture account; returns the access token. */
export async function signInFixture(): Promise<{ token: string; userId: string }> {
  const result = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: headers(PUBLISHABLE_KEY),
    body: JSON.stringify({ email: FIXTURE_EMAIL, password: FIXTURE_PASSWORD }),
  });
  const body = result.body as { access_token?: string; user?: { id?: string } } | null;
  if (result.status !== 200 || !body?.access_token || !body.user?.id) {
    throw new Error(`fixture sign-in failed: HTTP ${result.status}`);
  }
  return { token: body.access_token, userId: body.user.id };
}

export function isDeniedOrEmpty(result: RestResult): boolean {
  if (result.status >= 400) return true;
  return Array.isArray(result.body) && result.body.length === 0;
}

export function rowsOf(result: RestResult): Record<string, unknown>[] {
  return Array.isArray(result.body) ? (result.body as Record<string, unknown>[]) : [];
}
