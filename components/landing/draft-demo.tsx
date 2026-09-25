'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { ProfessorName } from '@/components/professor/professor-name';
import { RecordStrip } from '@/components/professor/record-strip';
import { DEMO, DEMO_LINK_MS, DEMO_START_MS, DEMO_STEP_MS, DEMO_TEXT } from './draft-demo-data';

// One animation that explains the product: a real record on the left, a draft that writes itself
// on the right. Every character is in the DOM from the first paint (opacity 0), so the block
// reserves its final size; CSS delays reveal them in order. The only JS measures the two
// highlighted phrases and draws the connector between them (globals.css "Landing draft demo").

const CORNER_RADIUS = 6;
const ANCHOR_INSET = 3;
const STACKED_GUTTER = 10;

interface Point {
  x: number;
  y: number;
}

/** Orthogonal path with rounded corners: horizontal to the gutter, vertical, horizontal to the end. */
function elbowPath(start: Point, gutterX: number, end: Point): string {
  const dy = end.y - start.y;
  const r = Math.min(
    CORNER_RADIUS,
    Math.abs(gutterX - start.x),
    Math.abs(end.x - gutterX),
    Math.abs(dy) / 2,
  );
  const sx = Math.sign(gutterX - start.x) || 1;
  const sy = Math.sign(dy) || 1;
  const ex = Math.sign(end.x - gutterX) || 1;
  return [
    `M ${start.x} ${start.y}`,
    `H ${gutterX - sx * r}`,
    `Q ${gutterX} ${start.y} ${gutterX} ${start.y + sy * r}`,
    `V ${end.y - sy * r}`,
    `Q ${gutterX} ${end.y} ${gutterX + ex * r} ${end.y}`,
    `H ${end.x}`,
  ].join(' ');
}

function firstLineRect(element: Element): DOMRect {
  return element.getClientRects()[0] ?? element.getBoundingClientRect();
}

function Typed({ text, from }: { text: string; from: number }) {
  return Array.from(text, (char, index) => (
    <span key={from + index} className="typed" style={{ '--i': from + index } as CSSProperties}>
      {char}
    </span>
  ));
}

export function DraftDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const recordMarkRef = useRef<HTMLElement>(null);
  const emailMarkRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const record = recordRef.current;
    const email = emailRef.current;
    const recordMark = recordMarkRef.current;
    const emailMark = emailMarkRef.current;
    const path = pathRef.current;
    if (!root || !record || !email || !recordMark || !emailMark || !path) return;

    const draw = () => {
      const origin = root.getBoundingClientRect();
      const recordBox = record.getBoundingClientRect();
      const emailBox = email.getBoundingClientRect();
      const a = firstLineRect(recordMark);
      const b = firstLineRect(emailMark);
      const isSideBySide = emailBox.left >= recordBox.right;
      const end = { x: b.left - origin.left - ANCHOR_INSET, y: b.bottom - origin.top };
      const start = isSideBySide
        ? { x: a.right - origin.left + ANCHOR_INSET, y: a.bottom - origin.top }
        : { x: a.left - origin.left - ANCHOR_INSET, y: a.bottom - origin.top };
      const gutterX = isSideBySide
        ? (recordBox.right + emailBox.left) / 2 - origin.left
        : recordBox.left - origin.left - STACKED_GUTTER;
      path.setAttribute('d', elbowPath(start, gutterX, end));
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const { subject, greeting, beforePhrase, phrase, afterPhrase, closing } = DEMO_TEXT;
  const offsets = {
    greeting: subject.length,
    beforePhrase: subject.length + greeting.length,
    phrase: subject.length + greeting.length + beforePhrase.length,
    afterPhrase: subject.length + greeting.length + beforePhrase.length + phrase.length,
    closing:
      subject.length + greeting.length + beforePhrase.length + phrase.length + afterPhrase.length,
  };

  return (
    <figure
      className="draft-demo mx-auto w-full max-w-5xl"
      style={
        {
          '--demo-start': `${DEMO_START_MS}ms`,
          '--demo-step': `${DEMO_STEP_MS}ms`,
          '--demo-link': `${DEMO_LINK_MS}ms`,
        } as CSSProperties
      }
    >
      <div
        ref={rootRef}
        className="relative grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-6"
      >
        {/* The record, in the draft page's summary order: name, title, university, strip, area. */}
        <div
          ref={recordRef}
          className="bg-muted flex flex-col gap-2 rounded-lg p-4 md:self-start md:p-5"
        >
          <p className="text-muted-foreground hidden text-[12px] font-semibold tracking-[0.06em] uppercase md:block">
            Record
          </p>
          <h3 className="font-display text-[20px] leading-[1.2] md:text-[22px]">
            <ProfessorName nameEn={DEMO.name_en} nameCn={DEMO.name_cn} />
          </h3>
          <p className="text-muted-foreground -mt-1 hidden text-[15px] md:block">{DEMO.title}</p>
          <p className="text-[15px] leading-snug">
            {DEMO.university_name}
            <br />
            <span className="text-muted-foreground hidden md:inline">{DEMO.school}</span>
          </p>
          <RecordStrip professor={DEMO} />
          <p className="text-muted-foreground mt-1 text-[13px]">Research area</p>
          <p className="-mt-1.5 text-base">
            <mark ref={recordMarkRef} className="demo-mark">
              {DEMO.research_phrase}
            </mark>
            {DEMO.research_rest}
          </p>
        </div>

        {/* The draft: subject then body, revealed character by character. */}
        <div ref={emailRef} className="card-soft flex flex-col">
          <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-2.5 text-[13px]">
            <span className="text-muted-foreground font-semibold">Draft email</span>
            <span className="border-input inline-flex overflow-hidden rounded-sm border font-medium">
              <span className="bg-primary text-primary-foreground px-2 py-0.5">Formal</span>
              <span className="px-2 py-0.5">Concise</span>
            </span>
          </div>
          <p className="bg-muted border-border border-b px-4 py-2 text-[14px] leading-snug">
            <span className="text-muted-foreground">Subject </span>
            <Typed text={subject} from={0} />
          </p>
          <p className="px-4 py-3 text-[14px] leading-[1.4] whitespace-pre-wrap md:text-[15px] md:leading-[1.45]">
            <Typed text={greeting} from={offsets.greeting} />
            <Typed text={beforePhrase} from={offsets.beforePhrase} />
            <mark ref={emailMarkRef} className="demo-mark">
              <Typed text={phrase} from={offsets.phrase} />
            </mark>
            <Typed text={afterPhrase} from={offsets.afterPhrase} />
            <Typed text={closing} from={offsets.closing} />
          </p>
        </div>

        <svg
          className="text-primary pointer-events-none absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            className="demo-line"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <figcaption className="text-muted-foreground mt-3 text-center text-[14px] md:mt-4 md:text-[15px]">
        Every draft is written from the professor’s actual research area and your profile. You edit
        it before sending.
      </figcaption>
    </figure>
  );
}
