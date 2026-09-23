import { buildSubject } from './prompt';
import type { DraftInput, LlmProvider } from './types';

// Deterministic template provider for local development and tests (PLAN.md §8).
// Never exposed to real users: production runs with LLM_PROVIDER=none until a key exists.

export const MOCK_FAIL_WHY_LINE = '__fail__';
const DEFAULT_LATENCY_MS = 800;
const DEGREE_LABEL = { master: "master's", phd: 'PhD' } as const;

function firstPhrase(researchArea: string | null): string | null {
  const phrase = researchArea?.split(/[;,.]/)[0]?.trim();
  return phrase ? phrase : null;
}

function bodyFor(input: DraftInput): string {
  const { student, professor, tone } = input;
  const phrase = firstPhrase(professor.researchArea);
  const strongest = student.achievements.slice(0, tone === 'concise' ? 1 : 2);
  const degree = DEGREE_LABEL[student.degree];
  const university = professor.universityName ?? 'your university';
  const home = student.homeUniversity ?? student.nationality ?? '';

  const intro =
    tone === 'concise'
      ? `I am ${student.fullName}, a ${student.major ?? student.targetField} graduate${home ? ` from ${home}` : ''}.`
      : `I am ${student.fullName}, a ${student.major ?? student.targetField} graduate${home ? ` from ${home}` : ''}${student.cgpa !== null && student.cgpaScale !== null ? ` (CGPA ${student.cgpa}/${student.cgpaScale})` : ''}.`;
  const link = phrase
    ? `Your work on ${phrase} is closely related to my interest in ${student.researchInterests?.split(/[.;]/)[0]?.trim().toLowerCase() ?? student.targetField.toLowerCase()}.`
    : `My interest in ${student.researchInterests?.split(/[.;]/)[0]?.trim().toLowerCase() ?? student.targetField.toLowerCase()} fits your group's direction.`;
  const facts = strongest.length > 0 ? `Relevant experience: ${strongest.join('; ')}.` : null;
  const why = input.whyLine ? input.whyLine : null;
  const ask = `I am applying for the CSC Type B ${student.intakeYear} ${degree} in ${student.targetField} at ${university}, and I would be grateful if you would consider issuing an acceptance letter.`;
  const funding =
    'CSC covers tuition and a living stipend, so I am not requesting laboratory funding.';
  const close = `Thank you for your time.\n\nKind regards,\n${student.fullName}${student.homeUniversity ? `\n${student.homeUniversity}` : ''}`;

  return [
    `Dear Professor ${professor.nameEn},`,
    '',
    [intro, link, facts, why].filter(Boolean).join(' '),
    '',
    `${ask} ${funding}`,
    '',
    close,
  ].join('\n');
}

export function createMockProvider(options: { latencyMs?: number } = {}): LlmProvider {
  const latency = options.latencyMs ?? DEFAULT_LATENCY_MS;
  return {
    name: 'mock',
    model: 'mock',
    async generate(input) {
      if (latency > 0) await new Promise((resolve) => setTimeout(resolve, latency));
      if (input.whyLine === MOCK_FAIL_WHY_LINE) throw new Error('mock provider forced failure');
      return { subject: buildSubject(input), body: bodyFor(input), model: 'mock' };
    },
  };
}
