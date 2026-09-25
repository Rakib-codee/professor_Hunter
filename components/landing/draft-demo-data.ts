// Static content for the landing draft demo. The record is Huang Feng from the live dataset
// (China University of Geosciences, Beijing); the email follows the shape of a formal draft from
// lib/llm/mock.ts, with the student invented.

export const DEMO = {
  name_en: 'Huang Feng',
  name_cn: '黄峰',
  title: 'Associate Professor',
  university_name: 'China University of Geosciences (Beijing)',
  school: 'School of Engineering and Technology',
  research_phrase: 'Rock/soil mechanics',
  research_rest: '; soil creep',
  accepts_intl: 'confirmed',
  last_verified: '2026-09-22',
  last_verified_on: '2026-09-22',
  email_type: 'university',
  has_email: true,
} as const;

// The body is split around the phrase that gets highlighted and linked back to the record.
export const DEMO_TEXT = {
  subject: 'Prospective Master’s Applicant (Civil Engineering, 2027) – Nadia Rahman',
  greeting: 'Dear Professor Huang Feng,\n\n',
  beforePhrase:
    'I am Nadia Rahman, a civil engineering graduate from BUET (CGPA 3.72/4.00). Your work on ',
  phrase: 'rock/soil mechanics',
  afterPhrase:
    ' is closely related to my thesis on rainfall-induced slope failures. I am applying for the CSC Type B 2027 master’s at CUGB and would be grateful if you would consider an acceptance letter.',
  closing: '\n\nKind regards,\nNadia Rahman',
} as const;

// Timing: characters reveal in order (subject first, then body) at one fixed step. The phrase
// highlight and connector appear the moment the phrase finishes typing. Total ≈ 4 s.
export const DEMO_START_MS = 400;
export const DEMO_STEP_MS = 7;

const PHRASE_END_INDEX =
  DEMO_TEXT.subject.length +
  DEMO_TEXT.greeting.length +
  DEMO_TEXT.beforePhrase.length +
  DEMO_TEXT.phrase.length;

export const DEMO_LINK_MS = DEMO_START_MS + PHRASE_END_INDEX * DEMO_STEP_MS;
