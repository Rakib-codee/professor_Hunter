import { z } from 'zod';

// Validated access to environment variables. Names match .env.example.
// Errors list the offending variable NAMES only — values are never included.

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_CONTACT_EMAIL: z.email().default('professorhunter.help@outlook.com'),
  // Optional. When set, the Cloudflare Turnstile widget renders on the auth forms and the
  // token is passed to Supabase Auth (which must have CAPTCHA protection enabled).
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  // Optional cookie-free analytics (Umami). Both must be set for the script to load.
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.url().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1).optional(),
});

export const LLM_PROVIDERS = ['none', 'mock', 'deepseek', 'groq'] as const;
export type LlmProviderName = (typeof LLM_PROVIDERS)[number];

const serverSchema = publicSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
  LLM_PROVIDER: z.enum(LLM_PROVIDERS).default('none'),
  LLM_FALLBACK_PROVIDER: z.enum(LLM_PROVIDERS).default('none'),
  DEEPSEEK_API_KEY: z.string().default(''),
  DEEPSEEK_MODEL: z.string().default('deepseek-flash'),
  GROQ_API_KEY: z.string().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function formatIssues(error: z.ZodError): string {
  const names = error.issues.map((issue) => issue.path.join('.') || '(root)');
  return `Invalid or missing environment variables: ${[...new Set(names)].join(', ')}. See .env.example.`;
}

type EnvSource = Record<string, string | undefined>;

function emptyToUndefined(source: EnvSource): EnvSource {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, value === '' ? undefined : value]),
  );
}

// Next.js inlines NEXT_PUBLIC_* only when referenced literally, so list them explicitly.
function readPublicSource(): Record<string, string | undefined> {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  };
}

let cachedPublic: PublicEnv | null = null;
let cachedServer: ServerEnv | null = null;

/** Safe in client and server code. */
export function getPublicEnv(): PublicEnv {
  if (cachedPublic) return cachedPublic;
  const parsed = publicSchema.safeParse(emptyToUndefined(readPublicSource()));
  if (!parsed.success) throw new Error(formatIssues(parsed.error));
  cachedPublic = parsed.data;
  return cachedPublic;
}

/** Server only. Never import from a client component. */
export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  const parsed = serverSchema.safeParse(
    emptyToUndefined({ ...process.env, ...readPublicSource() }),
  );
  if (!parsed.success) throw new Error(formatIssues(parsed.error));
  cachedServer = parsed.data;
  return cachedServer;
}

/** Test helper: forget cached values so a test can set process.env and re-read. */
export function resetEnvCache(): void {
  cachedPublic = null;
  cachedServer = null;
}
