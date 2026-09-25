'use client';

import { useFormStatus } from 'react-dom';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}

export function SubmitButton({ children, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className={cn('w-full', className)}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
