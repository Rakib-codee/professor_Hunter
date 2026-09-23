import type { DraftInput } from './types';

// System + user messages (PLAN.md §8 "Prompt"). The subject is fixed by us, never by the model.

const DEGREE_LABEL = { master: "Master's", phd: 'PhD' } as const;

/** What we ask the model for; validate.ts allows a little slack above this. */
export const PROMPT_WORD_TARGET = { formal: 180, concise: 120 } as const;

export function buildSubject(input: DraftInput): string {
  const { student } = input;
  return `Prospective ${DEGREE_LABEL[student.degree]} Applicant (${student.targetField}, ${student.intakeYear}) – ${student.fullName}`;
}

export interface Messages {
  system: string;
  user: string;
}

export function buildMessages(input: DraftInput): Messages {
  const { student, professor, tone } = input;
  const cap = PROMPT_WORD_TARGET[tone];
  const degree = DEGREE_LABEL[student.degree];
  const university = professor.universityName ?? 'your university';

  const system = [
    'You write a first-contact email from an international applicant to a professor in China, asking for an acceptance (supervisor consent) letter for a China Scholarship Council application.',
    'Hard rules:',
    `- At most ${cap} words in the body.`,
    `- Start with exactly "Dear Professor ${professor.nameEn}," (full name; never Mr, Ms or a guessed surname).`,
    "- One concrete sentence tying the applicant's interest to the professor's research area; quote a short phrase from it.",
    "- Use the applicant's two strongest facts from the list; do not invent papers, titles, grades or experience.",
    `- The ask: an acceptance letter for the CSC Type B ${student.intakeYear} ${degree} in ${student.targetField} at ${university}.`,
    '- One sentence stating that CSC covers tuition and a stipend, so no lab funding is requested.',
    "- Close politely with the applicant's full name and home university.",
    '- No flattery paragraph, no "I have followed your work for years", no emojis, no placeholders in square brackets.',
    tone === 'concise' ? '- Tone: brief and direct.' : '- Tone: formal and warm.',
    'Return strict JSON: {"subject": string, "body": string}. Nothing else.',
  ].join('\n');

  const facts = [
    `Applicant: ${student.fullName}`,
    student.nationality ? `Nationality: ${student.nationality}` : null,
    student.homeUniversity ? `Home university: ${student.homeUniversity}` : null,
    student.major ? `Major: ${student.major}` : null,
    student.cgpa !== null && student.cgpaScale !== null
      ? `CGPA: ${student.cgpa}/${student.cgpaScale}`
      : null,
    student.graduationYear ? `Graduation year: ${student.graduationYear}` : null,
    `Applying for: CSC Type B ${student.intakeYear} ${degree} in ${student.targetField}`,
    student.researchInterests ? `Research interests: ${student.researchInterests}` : null,
    student.researchTags.length > 0 ? `Research tags: ${student.researchTags.join(', ')}` : null,
    student.achievements.length > 0
      ? `Achievements:\n${student.achievements.map((a) => `- ${a}`).join('\n')}`
      : null,
    '',
    `Professor: ${professor.nameEn}${professor.title ? `, ${professor.title}` : ''}`,
    professor.universityName ? `University: ${professor.universityName}` : null,
    professor.field ? `Field: ${professor.field}` : null,
    professor.researchArea ? `Research area: ${professor.researchArea}` : null,
    professor.researchTags.length > 0
      ? `Professor tags: ${professor.researchTags.join(', ')}`
      : null,
    input.whyLine ? `\nWhy this professor (applicant's words): ${input.whyLine}` : null,
    input.retryHint
      ? `\nYour previous attempt was rejected: ${input.retryHint}. Fix this while keeping every other rule.`
      : null,
    `\nTone: ${tone}`,
  ];

  return { system, user: facts.filter((line): line is string => line !== null).join('\n') };
}
