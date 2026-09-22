// Imports professor_hunter_dataset_v4.csv into Supabase. Idempotent: re-running with the same
// file reports 0 inserted / 0 updated. Usage: npm run import:csv [-- path/to/file.csv]
// Requires SUPABASE_SECRET_KEY etc. in .env.local (loaded via --env-file in the npm script).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseCsv } from '../lib/import/csv';
import { importRows, type ImportSummary, type RowMessage } from '../lib/import/import';
import { createSupabaseImportDb } from '../lib/import/supabase-db';
import { createAdminClient } from '../lib/supabase/admin';

const DEFAULT_CSV = 'professor_hunter_dataset_v4.csv';
const TAGS_FILE = 'research_tags.json';
const MAX_LISTED_MESSAGES = 40;

function loadAllowedTags(): string[] {
  const parsed: unknown = JSON.parse(readFileSync(resolve(TAGS_FILE), 'utf8'));
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`${TAGS_FILE} must be an object of major -> tag list`);
  }
  return Object.values(parsed as Record<string, unknown>).flatMap((list) =>
    Array.isArray(list) ? list.filter((tag): tag is string => typeof tag === 'string') : [],
  );
}

function printMessages(title: string, messages: RowMessage[]): void {
  if (messages.length === 0) return;
  console.log(`\n${title} (${messages.length}):`);
  for (const { row, message } of messages.slice(0, MAX_LISTED_MESSAGES)) {
    console.log(`  line ${row}: ${message}`);
  }
  if (messages.length > MAX_LISTED_MESSAGES) {
    console.log(`  … ${messages.length - MAX_LISTED_MESSAGES} more`);
  }
}

function printSummary(summary: ImportSummary): void {
  console.log('\nImport summary');
  console.log(`  total rows : ${summary.total}`);
  console.log(`  inserted   : ${summary.inserted}`);
  console.log(`  updated    : ${summary.updated}`);
  console.log(`  unchanged  : ${summary.unchanged}`);
  console.log(`  skipped    : ${summary.skipped}`);
  printMessages('Warnings', summary.warnings);
  printMessages('Errors (rows skipped)', summary.errors);
}

async function main(): Promise<void> {
  const csvPath = resolve(process.argv[2] ?? DEFAULT_CSV);
  console.log(`Reading ${csvPath}`);
  const rows = parseCsv(readFileSync(csvPath, 'utf8'));
  console.log(`Parsed ${rows.length} rows`);

  const db = createSupabaseImportDb(createAdminClient());
  const summary = await importRows(rows, db, loadAllowedTags());
  printSummary(summary);

  if (summary.skipped > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error('Import failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
