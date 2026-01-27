import { vi } from "vitest";

/**
 * Time utility for deterministic testing.
 * Provides a clean API for freezing, advancing, and restoring system time.
 * Built on top of Vitest's timer system.
 */
export class Time {
  /**
   * Freezes time at a specific date for the duration of the provided function.
   * Automatically restores real time even if the function throws an error.
   *
   * @example
   * await Time.frozen('2024-05-20', async () => {
   *   const now = new Date();
   *   expect(now.toISOString()).toContain('2024-05-20');
   * });
   */
  static async frozen<T>(date: string | Date | number, fn: () => Promise<T> | T): Promise<T> {
    this.freeze(date);
    try {
      return await fn();
    } finally {
      this.restore();
    }
  }

  /**
   * Freezes system time.
   * Use this in beforeEach or for sequential time manipulation.
   * Remember to call Time.restore() in afterEach!
   */
  static freeze(date: string | Date | number): void {
    const targetDate = new Date(date);
    vi.useFakeTimers();
    vi.setSystemTime(targetDate);
  }

  /**
   * Advances the frozen time by a specific amount of milliseconds.
   */
  static advance(ms: number): void {
    vi.advanceTimersByTime(ms);
  }

  /**
   * Restores system time to reality.
   */
  static restore(): void {
    vi.useRealTimers();
  }
}
