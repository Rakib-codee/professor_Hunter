import researchTags from '@/research_tags.json';
import type { Field } from '@/lib/constants';

// Curated research tags per field (research_tags.json). Software Engineering professors in
// the dataset are tagged with the Computer Science vocabulary, so both fields share one list.

const TAGS = researchTags as Record<string, string[]>;

const FIELD_TAG_SOURCE: Record<Field, string> = {
  'Computer Science and Technology': 'Computer Science and Technology',
  'Software Engineering': 'Computer Science and Technology',
  'Civil Engineering': 'Civil Engineering',
};

export function tagsForField(field: Field): readonly string[] {
  return TAGS[FIELD_TAG_SOURCE[field]] ?? [];
}

export function isKnownTag(field: Field, tag: string): boolean {
  return tagsForField(field).includes(tag);
}
