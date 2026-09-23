import type { ComponentProps } from 'react';
import { cn } from 'cn';
import { Label } from '@/components/ui/label';

export interface SelectOption {
  value: string;
  label: string;
}

interface NativeSelectProps extends ComponentProps<'select'> {
  name: string;
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
}

// Plain <select> styled like Input. Works with FormData and server actions without client state.
export function NativeSelect({
  name,
  label,
  options,
  placeholder,
  error,
  className,
  ...props
}: NativeSelectProps) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive bg-background h-10 w-full rounded-sm border px-3 text-base outline-none focus-visible:ring-3',
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-destructive text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
