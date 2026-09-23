import { describe, expect, test } from 'vitest';
import type { ProfessorListItem } from '@/lib/data/professors';
import type { Student } from '@/lib/data/students';
import { toProfessorFacts, toStudentFacts } from './facts';

const student = {
  id: 'x',
  full_name: 'Nadia Rahman',
  nationality: 'Bangladesh',
  home_university: 'BUET',
  major: 'Civil Engineering',
  cgpa: 3.72,
  cgpa_scale: 4,
  graduation_year: 2025,
  degree_applying: 'master',
  intake_year: 2027,
  ielts: null,
  toefl: null,
  hsk: null,
  achievements: 'Paper A\nProject B',
  target_field: 'Civil Engineering',
  research_interests: 'Slopes',
  research_tags: ['Geotechnical Engineering'],
  cv_path: null,
  role: 'student',
  onboarding_completed_at: null,
  last_viewed_professor_id: null,
  created_at: '',
  updated_at: '',
} satisfies Student;

const professor = {
  id: 'p',
  name_en: 'Huang Feng',
  name_cn: '黄峰',
  title: 'Associate Professor',
  university_id: 'u',
  university_name: 'CUGB',
  province: 'Beijing',
  school: null,
  field: 'Civil Engineering',
  research_area: 'Rock/soil mechanics',
  research_tags: ['Geotechnical Engineering'],
  has_email: true,
  email_type: 'university',
  accepts_intl: 'confirmed',
  source_url: null,
  last_verified: null,
  last_verified_on: null,
  status: 'active',
} satisfies ProfessorListItem;

describe('facts mappers', () => {
  test('toStudentFacts splits achievements and defaults degree/field', () => {
    const facts = toStudentFacts(student);
    expect(facts.achievements).toEqual(['Paper A', 'Project B']);
    expect(facts.degree).toBe('master');
    expect(facts.targetField).toBe('Civil Engineering');
    expect(
      toStudentFacts({ ...student, degree_applying: null, target_field: null, full_name: null })
        .degree,
    ).toBe('master');
    expect(toStudentFacts({ ...student, full_name: null }).fullName).toBe('Applicant');
    expect(
      toStudentFacts({ ...student, target_field: null, major: 'Software Engineering' }).targetField,
    ).toBe('Software Engineering');
  });

  test('toProfessorFacts never includes email', () => {
    const facts = toProfessorFacts(professor);
    expect(facts).toEqual({
      nameEn: 'Huang Feng',
      title: 'Associate Professor',
      universityName: 'CUGB',
      field: 'Civil Engineering',
      researchArea: 'Rock/soil mechanics',
      researchTags: ['Geotechnical Engineering'],
    });
    expect(JSON.stringify(facts)).not.toMatch(/email/i);
  });
});
