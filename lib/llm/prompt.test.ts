import { describe, expect, test } from 'vitest';
import { DRAFT_INPUT_FIXTURE } from './fixtures';
import { buildMessages, buildSubject } from './prompt';

describe('buildSubject', () => {
  test('follows the fixed pattern for master and PhD', () => {
    expect(buildSubject(DRAFT_INPUT_FIXTURE)).toBe(
      "Prospective Master's Applicant (Civil Engineering, 2027) – Nadia Rahman",
    );
    expect(
      buildSubject({
        ...DRAFT_INPUT_FIXTURE,
        student: { ...DRAFT_INPUT_FIXTURE.student, degree: 'phd' },
      }),
    ).toBe('Prospective PhD Applicant (Civil Engineering, 2027) – Nadia Rahman');
  });
});

describe('buildMessages', () => {
  test('system prompt carries the hard rules', () => {
    const { system } = buildMessages(DRAFT_INPUT_FIXTURE);
    expect(system).toContain('Dear Professor Huang Feng');
    expect(system).toMatch(/CSC/);
    expect(system).toMatch(/tuition/i);
    expect(system).toMatch(/no emojis/i);
    expect(system).toMatch(/180 words/);
    expect(system).toMatch(/JSON/);
  });

  test('concise tone lowers the word cap', () => {
    const { system } = buildMessages({ ...DRAFT_INPUT_FIXTURE, tone: 'concise' });
    expect(system).toMatch(/120 words/);
  });

  test('user message contains the facts, the research area and the optional why-line', () => {
    const { user } = buildMessages({
      ...DRAFT_INPUT_FIXTURE,
      whyLine: 'Your soil creep model matches my thesis.',
    });
    expect(user).toContain('Rock/soil mechanics; soil creep');
    expect(user).toContain('BUET');
    expect(user).toContain('3.72/4');
    expect(user).toContain('Co-author, rainfall-induced slope stability study (2025)');
    expect(user).toContain('Your soil creep model matches my thesis.');
    expect(user).toContain('CSC Type B 2027');
  });

  test('retry hint is appended on the second attempt only', () => {
    expect(buildMessages(DRAFT_INPUT_FIXTURE).user).not.toMatch(/previous attempt/i);
    expect(buildMessages({ ...DRAFT_INPUT_FIXTURE, retryHint: 'body too long' }).user).toMatch(
      /previous attempt was rejected: body too long/i,
    );
  });

  test('omits blank facts instead of printing null', () => {
    const { user } = buildMessages({
      ...DRAFT_INPUT_FIXTURE,
      student: {
        ...DRAFT_INPUT_FIXTURE.student,
        cgpa: null,
        cgpaScale: null,
        achievements: [],
        researchInterests: null,
      },
    });
    expect(user).not.toMatch(/null|undefined/);
    expect(user).not.toMatch(/CGPA/);
  });
});
