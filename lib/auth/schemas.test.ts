import { describe, expect, test } from 'vitest';
import {
  forgotPasswordSchema,
  PASSWORD_MIN_LENGTH,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './schemas';

describe('signUpSchema', () => {
  test('accepts a valid sign-up and trims/lowercases the email', () => {
    // Arrange
    const input = {
      fullName: '  Rakib  ',
      email: '  Student@Example.COM ',
      password: 'correct horse',
    };

    // Act
    const result = signUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fullName: 'Rakib',
      email: 'student@example.com',
      password: 'correct horse',
    });
  });

  test('rejects a password shorter than the minimum', () => {
    const result = signUpSchema.safeParse({
      fullName: 'R',
      email: 'a@b.co',
      password: 'x'.repeat(PASSWORD_MIN_LENGTH - 1),
    });
    expect(result.success).toBe(false);
  });

  test('rejects an invalid email and an empty name', () => {
    expect(
      signUpSchema.safeParse({ fullName: '', email: 'nope', password: 'x'.repeat(8) }).success,
    ).toBe(false);
  });
});

describe('signInSchema', () => {
  test('requires email and a non-empty password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.co', password: 'pw' }).success).toBe(true);
    expect(signInSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  test('accepts an email only', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'A@B.CO' }).data).toEqual({ email: 'a@b.co' });
  });
});

describe('resetPasswordSchema', () => {
  test('requires the confirmation to match', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'longenough', confirm: 'longenough' }).success,
    ).toBe(true);
    const mismatch = resetPasswordSchema.safeParse({
      password: 'longenough',
      confirm: 'different',
    });
    expect(mismatch.success).toBe(false);
    expect(mismatch.error?.issues[0]?.path).toEqual(['confirm']);
  });
});
