import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends ComponentProps<'input'> {
  name: string;
  label: string;
  error?: string;
}

export function FormField({ name, label, error, id, ...inputProps }: FormFieldProps) {
  // Explicit id needed when several inputs share a name (e.g. repeated "achievements").
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
