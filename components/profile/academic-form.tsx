'use client';

import { useActionState } from 'react';
import { saveAcademicStep, type ProfileFlow } from '@/actions/profile';
import { FormField } from '@/components/form/form-field';
import { FormMessage } from '@/components/form/form-message';
import { NativeSelect } from '@/components/form/native-select';
import { SubmitButton } from '@/components/form/submit-button';
import { INTAKE_YEAR_MAX, INTAKE_YEAR_MIN } from '@/lib/constants';
import type { Student } from '@/lib/data/students';
import { INITIAL_FORM_STATE } from '@/lib/forms';
import {
  ACHIEVEMENT_MAX_ITEMS,
  ACHIEVEMENT_MAX_LENGTH,
  splitAchievements,
} from '@/lib/profile/schemas';

interface AcademicFormProps {
  student: Student;
  flow: ProfileFlow;
}

const DEGREE_OPTIONS = [
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
];

const text = (value: string | number | null | undefined): string =>
  value === null || value === undefined ? '' : String(value);

export function AcademicForm({ student, flow }: AcademicFormProps) {
  const [state, action] = useActionState(saveAcademicStep, INITIAL_FORM_STATE);
  const value = (name: keyof Student) =>
    state.values?.[name] ?? text(student[name] as string | number | null);
  const achievements = splitAchievements(student.achievements);

  return (
    <form key={state.attempt} action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="flow" value={flow} />
      <FormMessage error={state.error} message={state.message} />
      <div className="grid grid-cols-2 gap-3">
        <NativeSelect
          name="degree_applying"
          label="Applying for"
          options={DEGREE_OPTIONS}
          placeholder="Choose"
          defaultValue={value('degree_applying')}
          error={state.fieldErrors?.degree_applying}
        />
        <FormField
          name="intake_year"
          label="Intake year"
          type="number"
          inputMode="numeric"
          min={INTAKE_YEAR_MIN}
          max={INTAKE_YEAR_MAX}
          defaultValue={value('intake_year')}
          error={state.fieldErrors?.intake_year}
        />
      </div>
      <fieldset className="grid grid-cols-3 gap-3">
        <legend className="mb-1.5 text-[15px] font-medium">Language scores (optional)</legend>
        <FormField
          name="ielts"
          label="IELTS"
          type="number"
          inputMode="decimal"
          step="0.5"
          min={0}
          max={9}
          defaultValue={value('ielts')}
          error={state.fieldErrors?.ielts}
        />
        <FormField
          name="toefl"
          label="TOEFL"
          type="number"
          inputMode="numeric"
          min={0}
          max={120}
          defaultValue={value('toefl')}
          error={state.fieldErrors?.toefl}
        />
        <FormField
          name="hsk"
          label="HSK"
          type="number"
          inputMode="numeric"
          min={1}
          max={9}
          defaultValue={value('hsk')}
          error={state.fieldErrors?.hsk}
        />
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[15px] font-medium">
          Publications or projects (up to {ACHIEVEMENT_MAX_ITEMS})
        </legend>
        {Array.from({ length: ACHIEVEMENT_MAX_ITEMS }, (_, index) => (
          <FormField
            key={index}
            id={`achievements-${index + 1}`}
            name="achievements"
            label={`Item ${index + 1}`}
            maxLength={ACHIEVEMENT_MAX_LENGTH}
            placeholder={
              index === 0
                ? 'e.g. Co-author, IEEE Access 2025: slope stability under rainfall'
                : undefined
            }
            defaultValue={achievements[index] ?? ''}
          />
        ))}
        {state.fieldErrors?.achievements ? (
          <p className="text-destructive text-[13px]">{state.fieldErrors.achievements}</p>
        ) : (
          <p className="text-muted-foreground text-[13px]">
            One line each. These go into your draft email, so be specific.
          </p>
        )}
      </fieldset>
      <SubmitButton pendingText="Saving…">
        {flow === 'onboarding' ? 'Continue' : 'Save'}
      </SubmitButton>
    </form>
  );
}
