'use client';

import { useActionState, useState } from 'react';
import { saveResearchStep, type ProfileFlow } from '@/actions/profile';
import { FormMessage } from '@/components/form/form-message';
import { NativeSelect } from '@/components/form/native-select';
import { SubmitButton } from '@/components/form/submit-button';
import { TextareaField } from '@/components/form/textarea-field';
import { FIELDS, type Field } from '@/lib/constants';
import type { Student } from '@/lib/data/students';
import { INITIAL_FORM_STATE } from '@/lib/forms';
import { TAGS_MAX } from '@/lib/profile/schemas';
import { inferFieldFromMajor, tagsForField } from '@/lib/profile/tags';

interface ResearchFormProps {
  student: Student;
  flow: ProfileFlow;
}

const FIELD_OPTIONS = FIELDS.map((field) => ({ value: field, label: field }));

function asField(value: string | null | undefined): Field | null {
  return (FIELDS as readonly string[]).includes(value ?? '') ? (value as Field) : null;
}

export function ResearchForm({ student, flow }: ResearchFormProps) {
  const [state, action] = useActionState(saveResearchStep, INITIAL_FORM_STATE);
  // Preselect from the saved target field, else guess from the major typed in step 1.
  const [field, setField] = useState<Field | null>(
    asField(state.values?.target_field) ??
      asField(student.target_field) ??
      inferFieldFromMajor(student.major),
  );
  const tags = field ? tagsForField(field) : [];

  return (
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="flow" value={flow} />
      <FormMessage error={state.error} message={state.message} />
      <NativeSelect
        name="target_field"
        label="Target field"
        options={FIELD_OPTIONS}
        placeholder="Choose a field"
        defaultValue={field ?? ''}
        onChange={(event) => setField(asField(event.target.value))}
        error={state.fieldErrors?.target_field}
      />
      <TextareaField
        name="research_interests"
        label="Research interests"
        hint="A few sentences on what you want to work on. Used to personalise your draft."
        rows={4}
        defaultValue={state.values?.research_interests ?? student.research_interests ?? ''}
        error={state.fieldErrors?.research_interests}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Research tags (pick 1–{TAGS_MAX})</legend>
        {tags.length === 0 ? (
          <p className="text-muted-foreground text-xs">Choose a field to see its tags.</p>
        ) : (
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
                  defaultChecked={student.research_tags.includes(tag)}
                  className="sr-only"
                />
                {tag}
              </label>
            ))}
          </div>
        )}
        {state.fieldErrors?.research_tags ? (
          <p className="text-destructive text-xs">{state.fieldErrors.research_tags}</p>
        ) : null}
      </fieldset>
      <SubmitButton pendingText="Saving…">{flow === 'onboarding' ? 'Finish' : 'Save'}</SubmitButton>
    </form>
  );
}
