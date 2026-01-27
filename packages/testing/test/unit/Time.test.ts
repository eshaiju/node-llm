import { describe, it, expect } from "vitest";
import { Time } from "../../src/Time.js";

describe("Testing Utility: Time", () => {
  describe("Time.frozen", () => {
    it("freezes time and restores it automatically", async () => {
      const realStart = new Date().getTime();
      const target = "2024-05-20T10:00:00.000Z";

      await Time.frozen(target, async () => {
        expect(new Date().toISOString()).toBe(target);
      });

      // After restoration, time should represent reality again
      const realEnd = new Date().getTime();
      expect(realEnd).toBeGreaterThanOrEqual(realStart);
      expect(new Date().toISOString()).not.toBe(target);
    });

    it("restores time even on error", async () => {
      const target = "2024-01-01T00:00:00.000Z";

      try {
        await Time.frozen(target, () => {
          throw new Error("BOOM");
        });
      } catch {
        // Ignored
      }

      expect(new Date().toISOString()).not.toBe(target);
    });
  });

  describe("Stateful API (freeze / advance / restore)", () => {
    it("allows manual manipulation of time flow", () => {
      const start = "2024-12-31T23:59:59.000Z";
      Time.freeze(start);

      expect(new Date().toISOString()).toBe(start);

      // Advance by 2 seconds
      Time.advance(2000);
      expect(new Date().toISOString()).toBe("2025-01-01T00:00:01.000Z");

      Time.restore();
      expect(new Date().toISOString()).not.toBe("2025-01-01T00:00:01.000Z");
    });
  });
});
