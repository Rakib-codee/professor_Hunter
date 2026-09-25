import type { MissingItem } from './completeness';

// The profile page's three sections, their fields and the order they appear in. Shared by the
// section list (desktop), the tabs (mobile) and the completeness links, so a missing item always
// resolves to the section that contains its input.

export type ProfileSectionId = 'about' | 'application' | 'research';

export interface ProfileSection {
  id: ProfileSectionId;
  /** Short label for the section list and tabs. */
  label: string;
  /** Heading above the form. */
  title: string;
  description?: string;
  /** Input (or fieldset) ids inside the section, in form order. */
  fields: readonly string[];
}

export const PROFILE_SECTIONS: readonly ProfileSection[] = [
  {
    id: 'about',
    label: 'About you',
    title: 'About you',
    fields: ['full_name', 'nationality', 'home_university', 'major', 'cgpa', 'graduation_year'],
  },
  {
    id: 'application',
    label: 'Application',
    title: 'Your application',
    fields: ['degree_applying', 'intake_year', 'achievements-1'],
  },
  {
    id: 'research',
    label: 'Research',
    title: 'Your research',
    description: 'Used to match professors and personalise drafts.',
    fields: ['target_field', 'research_interests', 'research_tags'],
  },
];

/** DOM id of a section's wrapper, used for anchors and the scroll spy. */
export function sectionElementId(id: ProfileSectionId): string {
  return `section-${id}`;
}

export function sectionForField(field: string): ProfileSectionId | null {
  return PROFILE_SECTIONS.find((section) => section.fields.includes(field))?.id ?? null;
}

export function nextSection(id: ProfileSectionId): ProfileSection | null {
  const index = PROFILE_SECTIONS.findIndex((section) => section.id === id);
  return PROFILE_SECTIONS[index + 1] ?? null;
}

export type MissingBySection = Record<ProfileSectionId, number>;

/** How many missing items each section has, so the list can show "2 missing" or "Complete". */
export function missingBySection(items: readonly MissingItem[]): MissingBySection {
  return items.reduce<MissingBySection>(
    (acc, item) => {
      const section = sectionForField(item.field);
      return section ? { ...acc, [section]: acc[section] + 1 } : acc;
    },
    { about: 0, application: 0, research: 0 },
  );
}
