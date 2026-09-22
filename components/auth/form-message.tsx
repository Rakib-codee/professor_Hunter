import { cn } from 'cn';

interface FormMessageProps {
  error?: string;
  message?: string;
}

// Form-level feedback. role="alert" so screen readers announce it on submit.
export function FormMessage({ error, message }: FormMessageProps) {
  const text = error ?? message;
  if (!text) return null;
  return (
    <p
      role="alert"
      className={cn(
        'rounded-lg px-3 py-2 text-sm',
        error ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground',
      )}
    >
      {text}
    </p>
  );
}
