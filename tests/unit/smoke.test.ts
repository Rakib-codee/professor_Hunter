import { describe, expect, test } from 'vitest';

// Proves the Vitest + path-alias setup works. Replaced by real lib/ tests from Day 2.
describe('test harness', () => {
  test('runs a trivial assertion', () => {
    // Arrange
    const values = [1, 2, 3];

    // Act
    const total = values.reduce((sum, value) => sum + value, 0);

    // Assert
    expect(total).toBe(6);
  });
});
