'use client';

import { useActionState, useState } from 'react';
import { updateProfessor } from '@/actions/admin';
import { FormField } from '@/components/form/form-field';
import { FormMessage } from '@/components/form/form-message';
import { NativeSelect } from '@/components/form/native-select';
import { SubmitButton } from '@/components/form/submit-button';
import { TextareaField } from '@/components/form/textarea-field';
import { ACCEPTS_VALUES, PROFESSOR_STATUSES } from '@/lib/admin/professor-schema';
import { FIELDS, type Field } from '@/lib/constants';
import type { ProfessorAdminRow } from '@/lib/data/admin';
import { INITIAL_FORM_STATE } from '@/lib/forms';
import { tagsForField } from '@/lib/profile/tags';
import { acceptsLabel } from '@/lib/utils/display';

const asField = (value: string | null | undefined): Field | null =>
  (FIELDS as readonly string[]).includes(value ?? '') ? (value as Field) : null;
const text = (value: string | null | undefined) => value ?? '';

export function ProfessorForm({ professor }: { professor: ProfessorAdminRow }) {
  const [state, action] = useActionState(
    updateProfessor.bind(null, professor.id),
    INITIAL_FORM_STATE,
  );
  const value = (name: keyof ProfessorAdminRow) =>
    state.values?.[name] ?? text(professor[name] as string | null);
  const [field, setField] = useState<Field | null>(
    asField(state.values?.field) ?? asField(professor.field),
  );
  const tags = field ? tagsForField(field) : [];

  return (
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage error={state.error} message={state.message} />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          name="name_en"
          label="Name (English)"
          required
          defaultValue={value('name_en')}
          error={state.fieldErrors?.name_en}
        />
        <FormField
          name="name_cn"
          label="Name (Chinese)"
          defaultValue={value('name_cn')}
          error={state.fieldErrors?.name_cn}
        />
        <FormField
          name="title"
          label="Title"
          defaultValue={value('title')}
          error={state.fieldErrors?.title}
        />
        <FormField
          name="school"
          label="School"
          defaultValue={value('school')}
          error={state.fieldErrors?.school}
        />
        <NativeSelect
          name="field"
          label="Field"
          options={FIELDS.map((f) => ({ value: f, label: f }))}
          defaultValue={field ?? ''}
          placeholder="Choose"
          onChange={(e) => setField(asField(e.target.value))}
          error={state.fieldErrors?.field}
        />
        <NativeSelect
          name="status"
          label="Status"
          options={PROFESSOR_STATUSES.map((s) => ({ value: s, label: s }))}
          defaultValue={value('status')}
          error={state.fieldErrors?.status}
        />
      </div>
      <TextareaField
        name="research_area"
        label="Research area"
        rows={3}
        defaultValue={value('research_area')}
        error={state.fieldErrors?.research_area}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Research tags</legend>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag}
              className="has-checked:bg-primary has-checked:text-primary-foreground has-checked:border-primary border-border cursor-pointer rounded-full border px-3 py-1 text-sm select-none"
            >
              <input
                type="checkbox"
                name="research_tags"
                value={tag}
                defaultChecked={professor.research_tags.includes(tag)}
                className="sr-only"
              />
              {tag}
            </label>
          ))}
        </div>
        {state.fieldErrors?.research_tags ? (
          <p className="text-destructive text-xs">{state.fieldErrors.research_tags}</p>
        ) : null}
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          name="email"
          label="Email (blank = none)"
          type="email"
          defaultValue={value('email')}
          error={state.fieldErrors?.email}
        />
        <NativeSelect
          name="accepts_intl"
          label="International students"
          options={ACCEPTS_VALUES.map((v) => ({ value: v, label: acceptsLabel(v).text }))}
          defaultValue={value('accepts_intl')}
          error={state.fieldErrors?.accepts_intl}
        />
        <FormField
          name="source_url"
          label="Source URL"
          type="url"
          defaultValue={value('source_url')}
          error={state.fieldErrors?.source_url}
        />
        <FormField
          name="last_verified"
          label="Last verified (YYYY-MM or YYYY-MM-DD)"
          defaultValue={value('last_verified')}
          error={state.fieldErrors?.last_verified}
        />
        <FormField
          name="gender"
          label="Gender"
          defaultValue={value('gender')}
          error={state.fieldErrors?.gender}
        />
      </div>
      <TextareaField
        name="notes"
        label="Internal notes (never shown to students)"
        rows={3}
        defaultValue={value('notes')}
        error={state.fieldErrors?.notes}
      />
      <p className="text-muted-foreground text-xs">
        Email type ({professor.email_type}) and the sortable verification date are recalculated on
        save. University changes go through Supabase Studio.
      </p>
      <SubmitButton pendingText="Saving…">Save</SubmitButton>
    </form>
  );
}
