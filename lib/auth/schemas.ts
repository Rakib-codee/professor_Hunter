import { z } from 'zod';

// Zod schemas for the auth forms. Server actions parse FormData through these, so the
// server never trusts a field the client did not validate.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72; // bcrypt limit; Supabase silently truncates beyond it
const NAME_MAX_LENGTH = 120;

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));
const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`);

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name').max(NAME_MAX_LENGTH),
  email,
  password,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
