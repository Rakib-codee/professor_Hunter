import type { CsvRow } from './types';

// Minimal RFC 4180 parser: quoted fields, doubled quotes, CR/LF, embedded newlines.
// The dataset is produced by Python's csv module, which follows the same rules.

export const CSV_COLUMNS = [
  'university',
  'school',
  'field',
  'name_cn',
  'name_en',
  'title',
  'research_area',
  'email',
  'accepts_intl_students',
  'source_url',
  'last_verified',
  'notes',
  'gender',
  'research_tags',
] as const satisfies readonly (keyof CsvRow)[];

const BOM = '﻿';
const QUOTE = '"';
const COMMA = ',';

/** Splits CSV text into records of raw string fields. Ignores fully empty trailing lines. */
export function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let fields: string[] = [];
  let field = '';
  let inQuotes = false;
  let index = 0;

  const endField = () => {
    fields = [...fields, field];
    field = '';
  };
  const endRecord = () => {
    endField();
    records.push(fields);
    fields = [];
  };

  while (index < text.length) {
    const char = text[index];

    if (inQuotes) {
      if (char === QUOTE && text[index + 1] === QUOTE) {
        field += QUOTE;
        index += 2;
        continue;
      }
      if (char === QUOTE) {
        inQuotes = false;
      } else {
        field += char;
      }
      index += 1;
      continue;
    }

    if (char === QUOTE) {
      inQuotes = true;
    } else if (char === COMMA) {
      endField();
    } else if (char === '\r') {
      // handled by the following \n
    } else if (char === '\n') {
      endRecord();
    } else {
      field += char;
    }
    index += 1;
  }

  if (field !== '' || fields.length > 0) endRecord();

  return records.filter((record) => !(record.length === 1 && record[0] === ''));
}

/** Parses the full dataset file into typed rows, validating the header and field counts. */
export function parseCsv(text: string): CsvRow[] {
  const records = parseCsvRecords(text.startsWith(BOM) ? text.slice(BOM.length) : text);
  const [header, ...body] = records;

  if (!header || header.join(',') !== CSV_COLUMNS.join(',')) {
    throw new Error(`CSV header does not match the expected 14 columns: ${CSV_COLUMNS.join(',')}`);
  }

  return body.map((record, index) => {
    if (record.length !== CSV_COLUMNS.length) {
      throw new Error(
        `CSV line ${index + 2} has ${record.length} fields, expected ${CSV_COLUMNS.length}`,
      );
    }
    return Object.fromEntries(
      CSV_COLUMNS.map((column, position) => [column, record[position]]),
    ) as unknown as CsvRow;
  });
}
