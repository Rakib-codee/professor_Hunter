// CV upload rules (PLAN.md §9 week 5): PDF only, 2 MB cap, one object per student.

export const CV_MAX_BYTES = 2 * 1024 * 1024;
export const CV_BUCKET = 'cvs';

export interface FileLike {
  name: string;
  type: string;
  size: number;
}

export type CvValidation = { ok: true } | { ok: false; error: string };

export function validateCvFile(file: FileLike): CvValidation {
  const isPdf = file.type === 'application/pdf' || (file.type === '' && /\.pdf$/i.test(file.name));
  if (!isPdf) return { ok: false, error: 'Upload a PDF file.' };
  if (file.size <= 0) return { ok: false, error: 'That file is empty.' };
  if (file.size > CV_MAX_BYTES) return { ok: false, error: 'Keep the PDF under 2 MB.' };
  return { ok: true };
}

export function cvPathFor(studentId: string): string {
  return `${studentId}/cv.pdf`;
}
