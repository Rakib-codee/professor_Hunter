import { describe, expect, test } from 'vitest';
import { buildMailto } from './mailto';

describe('buildMailto', () => {
  test('encodes subject and body, keeps line breaks', () => {
    const href = buildMailto('a@b.edu.cn', 'Hello & welcome', 'Line 1\nLine 2');
    expect(href).toBe('mailto:a@b.edu.cn?subject=Hello%20%26%20welcome&body=Line%201%0ALine%202');
  });
});
