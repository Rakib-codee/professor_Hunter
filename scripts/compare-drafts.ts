// Side-by-side draft comparison across configured providers (PLAN.md §8). Runs the mock plus
// any provider whose key exists. Writes out/compare-<date>.md. Usage: npm run compare:drafts

import { mkdirSync, writeFileSync } from 'node:fs';
import { getServerEnv } from '../lib/env';
import { PROFESSOR_FIXTURE, STUDENT_FIXTURE } from '../lib/llm/fixtures';
import { createMockProvider } from '../lib/llm/mock';
import { createOpenAiCompatibleProvider } from '../lib/llm/openai-compatible';
import type { DraftInput, LlmProvider, Tone } from '../lib/llm/types';
import { countWords, validateDraft } from '../lib/llm/validate';

const STUDENTS: DraftInput['student'][] = [
  STUDENT_FIXTURE,
  {
    ...STUDENT_FIXTURE,
    fullName: 'Arif Hossain',
    major: 'Computer Science',
    degree: 'phd',
    targetField: 'Computer Science and Technology',
    researchInterests: 'Graph neural networks for traffic forecasting.',
    researchTags: ['Machine Learning & Deep Learning'],
    achievements: ['First author, workshop paper on GNN traffic models (2025)'],
  },
  {
    ...STUDENT_FIXTURE,
    fullName: 'Sara Khan',
    major: 'Software Engineering',
    targetField: 'Software Engineering',
    cgpa: 3.4,
    achievements: [],
    researchInterests: 'Reliability of microservice systems.',
    researchTags: ['Software Engineering & Systems'],
  },
];
const PROFESSORS: DraftInput['professor'][] = [
  PROFESSOR_FIXTURE,
  {
    nameEn: 'Wang Lei',
    title: 'Professor',
    universityName: 'Tongji University',
    field: 'Computer Science and Technology',
    researchArea: 'Spatio-temporal data mining; urban computing',
    researchTags: ['Data Mining & Big Data'],
  },
  {
    nameEn: 'Chen Hua',
    title: null,
    universityName: 'Zhejiang University',
    field: 'Software Engineering',
    researchArea: 'Cloud-native systems; software reliability',
    researchTags: ['Software Engineering & Systems'],
  },
];
const TONES: Tone[] = ['formal', 'concise'];

function providers(): LlmProvider[] {
  const env = getServerEnv();
  const list: LlmProvider[] = [createMockProvider({ latencyMs: 0 })];
  if (env.DEEPSEEK_API_KEY)
    list.push(
      createOpenAiCompatibleProvider({
        name: 'deepseek',
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: env.DEEPSEEK_API_KEY,
        model: env.DEEPSEEK_MODEL,
      }),
    );
  if (env.GROQ_API_KEY)
    list.push(
      createOpenAiCompatibleProvider({
        name: 'groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
      }),
    );
  return list;
}

async function main(): Promise<void> {
  const chain = providers();
  const lines: string[] = [
    `# Draft comparison ${new Date().toISOString()}`,
    '',
    `Providers: ${chain.map((p) => `${p.name} (${p.model})`).join(', ')}`,
    '',
  ];
  for (const student of STUDENTS) {
    for (const professor of PROFESSORS) {
      for (const tone of TONES) {
        lines.push(`## ${student.fullName} → ${professor.nameEn} (${tone})`, '');
        for (const provider of chain) {
          const started = Date.now();
          try {
            const out = await provider.generate({ student, professor, tone });
            const check = validateDraft(out.body, tone, professor.researchArea);
            lines.push(
              `### ${provider.name} · ${Date.now() - started} ms · ${countWords(out.body)} words · tokens ${out.promptTokens ?? '?'}/${out.completionTokens ?? '?'} · ${check.ok ? 'valid' : `issues: ${check.issues.join(', ')}`}`,
              '',
              out.body.replace(/^/gm, '> '),
              '',
            );
          } catch (error) {
            lines.push(
              `### ${provider.name} · failed: ${error instanceof Error ? error.message : String(error)}`,
              '',
            );
          }
        }
      }
    }
  }
  mkdirSync('out', { recursive: true });
  const file = `out/compare-${new Date().toISOString().slice(0, 10)}.md`;
  writeFileSync(file, lines.join('\n'));
  console.log(
    `Wrote ${file} (${chain.length} providers, ${STUDENTS.length * PROFESSORS.length * TONES.length} cases)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
