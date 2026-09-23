import type { DraftInput } from './types';

// Shared synthetic facts for unit tests and scripts/compare-drafts.ts. Not real people.
export const STUDENT_FIXTURE: DraftInput['student'] = {
  fullName: 'Nadia Rahman',
  nationality: 'Bangladesh',
  homeUniversity: 'BUET',
  major: 'Civil Engineering',
  cgpa: 3.72,
  cgpaScale: 4,
  graduationYear: 2025,
  degree: 'master',
  intakeYear: 2027,
  achievements: [
    'Co-author, rainfall-induced slope stability study (2025)',
    'Final-year project on pile foundations in soft clay',
  ],
  targetField: 'Civil Engineering',
  researchInterests: 'Slope stability under extreme rainfall and soil-structure interaction.',
  researchTags: ['Geotechnical Engineering'],
};

export const PROFESSOR_FIXTURE: DraftInput['professor'] = {
  nameEn: 'Huang Feng',
  title: 'Associate Professor',
  universityName: 'China University of Geosciences (Beijing)',
  field: 'Civil Engineering',
  researchArea: 'Rock/soil mechanics; soil creep',
  researchTags: ['Geotechnical Engineering', 'Computational Mechanics & Numerical Modelling'],
};

export const DRAFT_INPUT_FIXTURE: DraftInput = {
  student: STUDENT_FIXTURE,
  professor: PROFESSOR_FIXTURE,
  tone: 'formal',
};
