// Provider abstraction for draft generation (PLAN.md §8). Email never enters these types.

export type Tone = 'formal' | 'concise';
export type Degree = 'master' | 'phd';

export interface StudentFacts {
  fullName: string;
  nationality: string | null;
  homeUniversity: string | null;
  major: string | null;
  cgpa: number | null;
  cgpaScale: number | null;
  graduationYear: number | null;
  degree: Degree;
  intakeYear: number;
  achievements: string[];
  targetField: string;
  researchInterests: string | null;
  researchTags: string[];
}

export interface ProfessorFacts {
  nameEn: string;
  title: string | null;
  universityName: string | null;
  field: string | null;
  researchArea: string | null;
  researchTags: string[];
}

export interface DraftInput {
  student: StudentFacts;
  professor: ProfessorFacts;
  tone: Tone;
  /** Optional one-liner from the student: why this professor. ≤ 200 chars, validated upstream. */
  whyLine?: string;
  /** Set on the single retry after validation failed: what to fix. */
  retryHint?: string;
}

export interface DraftOutput {
  subject: string;
  body: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export interface LlmProvider {
  name: string;
  model: string;
  generate(input: DraftInput): Promise<DraftOutput>;
}
