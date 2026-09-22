import { describe, expect, test } from 'vitest';
import { CSV_COLUMNS, parseCsv, parseCsvRecords } from './csv';

const HEADER = CSV_COLUMNS.join(',');

describe('parseCsvRecords', () => {
  test('splits simple rows', () => {
    expect(parseCsvRecords('a,b,c\n1,2,3\n')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  test('handles quoted fields with commas, escaped quotes and newlines', () => {
    const text = 'a,b\n"x, y","say ""hi"""\n"multi\nline",z\n';

    expect(parseCsvRecords(text)).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['multi\nline', 'z'],
    ]);
  });

  test('accepts CRLF and a missing final newline', () => {
    expect(parseCsvRecords('a,b\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  test('keeps empty fields', () => {
    expect(parseCsvRecords('a,,c\n,,\n')).toEqual([
      ['a', '', 'c'],
      ['', '', ''],
    ]);
  });
});

describe('parseCsv', () => {
  test('strips the BOM and maps rows onto the 14 dataset columns', () => {
    const text =
      '﻿' +
      HEADER +
      '\n' +
      'Tongji University,,Civil Engineering,,Wang Fang,Professor,"Soil; rock",w@tongji.edu.cn,unknown,,2025-01,,,"Geotechnical Engineering; Structural Engineering"\n';

    const rows = parseCsv(text);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      university: 'Tongji University',
      school: '',
      field: 'Civil Engineering',
      name_en: 'Wang Fang',
      research_area: 'Soil; rock',
      email: 'w@tongji.edu.cn',
      research_tags: 'Geotechnical Engineering; Structural Engineering',
    });
  });

  test('rejects a header that does not match the expected columns', () => {
    expect(() => parseCsv('university,name_en\nx,y\n')).toThrow(/header/);
  });

  test('rejects a row with the wrong number of fields', () => {
    expect(() => parseCsv(HEADER + '\nonly,three,fields\n')).toThrow(/line 2/);
  });

  test('ignores trailing blank lines', () => {
    const text = HEADER + '\n' + Array(14).fill('x').join(',') + '\n\n\n';

    expect(parseCsv(text)).toHaveLength(1);
  });
});
