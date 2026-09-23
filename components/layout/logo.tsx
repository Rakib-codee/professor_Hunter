import { cn } from 'cn';

// Brand mark (DESIGN.md §8): the emblem from the supplied logo redrawn as a flat vector so it is
// crisp at 32 px and weighs under 1 KB. Ink parts take --logo-ink (Cobalt on Paper, white in the
// dark header); the compass is always gold. Decorative: the wordmark carries the accessible name.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 112"
      aria-hidden="true"
      focusable="false"
      className={cn('block h-8 w-auto shrink-0', className)}
    >
      <g fill="var(--logo-ink)">
        <path d="M8 74C26 66 46 68 62 78L62 102C46 92 26 90 8 96Z" />
        <path d="M120 74C102 66 82 68 66 78L66 102C82 92 102 90 120 96Z" />
        <path d="M14 100C30 94 48 96 62 106L64 108L66 106C80 96 98 94 114 100L114 104C98 98 80 100 66 110L64 112L62 110C48 100 30 98 14 104Z" />
        <path
          fillRule="evenodd"
          d="M52 84C46 72 44 52 50 40C54 32 62 28 70 28C78 28 84 33 87 40L97 47C98.5 49 97 52.5 93.5 54.5L89.5 52.5C87.5 51 85 50 83.5 51C81 56 78 60 76 66L76 84ZM73.4 39.5A2.4 2.4 0 1 0 78.2 39.5A2.4 2.4 0 1 0 73.4 39.5Z"
        />
      </g>
      <path fill="none" stroke="var(--gold)" strokeWidth="5" d="M42.8 69.2A30 30 0 1 1 85.2 69.2" />
      <g fill="var(--gold)">
        <path d="M64 2L69.5 18L64 32L58.5 18Z" />
        <path d="M126 48L110 53.5L96 48L110 42.5Z" />
        <path d="M2 48L18 42.5L32 48L18 53.5Z" />
      </g>
    </svg>
  );
}

// Wordmark set in the display face (the one place Archivo goes below 20 px, DESIGN.md §8).
// "Hunter" takes --logo-accent: gold in the dark header, plain Ink on Paper.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'display-figure text-[12px] leading-none tracking-[0.16em] whitespace-nowrap uppercase',
        className,
      )}
    >
      Professor <span style={{ color: 'var(--logo-accent)' }}>Hunter</span>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <Wordmark />
    </span>
  );
}
