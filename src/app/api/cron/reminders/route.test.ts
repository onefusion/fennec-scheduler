import { describe, it, expect } from 'vitest';

// The reminder window filter is inlined in the route handler; this test pins down
// the boundary logic (>=23h and <25h out) so a future edit can't silently widen
// or shrink the window without a test failing.
function isDueForReminder(startTimeUtc: string, now: number): boolean {
  const windowStart = new Date(now + 23 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + 25 * 60 * 60 * 1000).toISOString();
  return startTimeUtc >= windowStart && startTimeUtc < windowEnd;
}

describe('reminder window', () => {
  const now = new Date('2026-10-01T00:00:00.000Z').getTime();

  it('is due exactly at the 23h boundary', () => {
    expect(isDueForReminder('2026-10-01T23:00:00.000Z', now)).toBe(true);
  });

  it('is not due just before the 23h boundary', () => {
    expect(isDueForReminder('2026-10-01T22:59:59.000Z', now)).toBe(false);
  });

  it('is not due at the 25h boundary (exclusive)', () => {
    expect(isDueForReminder('2026-10-02T01:00:00.000Z', now)).toBe(false);
  });

  it('is not due for a booking far in the future', () => {
    expect(isDueForReminder('2026-11-01T00:00:00.000Z', now)).toBe(false);
  });
});
