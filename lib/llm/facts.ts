import type { ProfessorListItem } from '@/lib/data/professors';
import type { Student } from '@/lib/data/students';
import { splitAchievements } from '@/lib/profile/schemas';
import type { ProfessorFacts, StudentFacts } from './types';

// Maps database rows to the facts the prompt sees. Email is deliberately absent.

const FALLBACK_NAME = 'Applicant';

export function toStudentFacts(student: Student): StudentFacts {
  return {
    fullName: student.full_name?.trim() || FALLBACK_NAME,
    nationality: student.nationality,
    homeUniversity: student.home_university,
    major: student.major,
    cgpa: student.cgpa,
    cgpaScale: student.cgpa_scale,
    graduationYear: student.graduation_year,
    degree: student.degree_applying ?? 'master',
    intakeYear: student.intake_year,
    achievements: splitAchievements(student.achievements),
    targetField: student.target_field ?? student.major ?? 'my field',
    researchInterests: student.research_interests,
    researchTags: student.research_tags,
  };
}

export function toProfessorFacts(professor: ProfessorListItem): ProfessorFacts {
  return {
    nameEn: professor.name_en,
    title: professor.title,
    universityName: professor.university_name,
    field: professor.field,
    researchArea: professor.research_area,
    researchTags: professor.research_tags,
  };
}
