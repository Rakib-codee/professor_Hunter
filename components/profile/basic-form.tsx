'use client';

import { useActionState } from 'react';
import { saveBasicStep, type ProfileFlow } from '@/actions/profile';
import { FormField } from '@/components/form/form-field';
import { FormMessage } from '@/components/form/form-message';
import { NativeSelect } from '@/components/form/native-select';
import { SubmitButton } from '@/components/form/submit-button';
import { CGPA_SCALES, FIELDS, GRADUATION_YEAR_MAX, GRADUATION_YEAR_MIN } from '@/lib/constants';
import type { Student } from '@/lib/data/students';
import { INITIAL_FORM_STATE } from '@/lib/forms';

interface BasicFormProps {
  student: Student;
  flow: ProfileFlow;
}

const SCALE_OPTIONS = CGPA_SCALES.map((scale) => ({
  value: String(scale),
  label: `out of ${scale}`,
}));

const text = (value: string | number | null | undefined): string =>
  value === null || value === undefined ? '' : String(value);

export function BasicForm({ student, flow }: BasicFormProps) {
  const [state, action] = useActionState(saveBasicStep, INITIAL_FORM_STATE);
  const value = (name: keyof Student) =>
    state.values?.[name] ?? text(student[name] as string | number | null);

  return (
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="flow" value={flow} />
      <FormMessage error={state.error} message={state.message} />
      <FormField
        name="full_name"
        label="Full name"
        autoComplete="name"
        required
        defaultValue={value('full_name')}
        error={state.fieldErrors?.full_name}
      />
      <FormField
        name="nationality"
        label="Nationality"
        autoComplete="country-name"
        defaultValue={value('nationality')}
        error={state.fieldErrors?.nationality}
      />
      <FormField
        name="home_university"
        label="Current university"
        defaultValue={value('home_university')}
        error={state.fieldErrors?.home_university}
      />
      <FormField
        name="major"
        label="Major"
        placeholder="e.g. Civil Engineering"
        list="major-suggestions"
        defaultValue={value('major')}
        error={state.fieldErrors?.major}
      />
      <datalist id="major-suggestions">
        {FIELDS.map((field) => (
          <option key={field} value={field} />
        ))}
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="cgpa"
          label="CGPA"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          defaultValue={value('cgpa')}
          error={state.fieldErrors?.cgpa}
        />
        <NativeSelect
          name="cgpa_scale"
          label="Scale"
          options={SCALE_OPTIONS}
          placeholder="Choose"
          defaultValue={value('cgpa_scale')}
          error={state.fieldErrors?.cgpa_scale}
        />
      </div>
      <FormField
        name="graduation_year"
        label="Graduation year"
        type="number"
        inputMode="numeric"
        min={GRADUATION_YEAR_MIN}
        max={GRADUATION_YEAR_MAX}
        defaultValue={value('graduation_year')}
        error={state.fieldErrors?.graduation_year}
      />
      <SubmitButton pendingText="Saving…">
        {flow === 'onboarding' ? 'Continue' : 'Save'}
      </SubmitButton>
    </form>
  );
}
