import { describe, expect, it } from "bun:test";
import { CircularFixDetector } from "./circular-detector";

describe("CircularFixDetector (Jaccard)", () => {
  it("should detect exact matches", () => {
    const detector = new CircularFixDetector();
    const error = "TypeError: Cannot read property 'foo' of undefined";

    detector.check(error);
    const result = detector.check(error); // 2nd occurrence

    expect(result.detected).toBe(true);
  });

  it("should detect similar but not exact matches (Jaccard >= 0.3)", () => {
    const detector = new CircularFixDetector();
    const error1 = "Tests failed: Expected 'A' but got 'B' in auth.ts:45";
    const error2 = "Tests failed: Expected 'A' but got 'C' in auth.ts:45"; // Highly similar

    detector.check(error1);
    const result = detector.check(error2);

    expect(result.detected).toBe(true);
    expect(result.similarity).toBeGreaterThan(0.7);
  });

  it("should not detect distinct errors", () => {
    const detector = new CircularFixDetector();
    const error1 = "Lint error: missing semicolon";
    const error2 = "ReferenceError: bar is not defined";

    detector.check(error1);
    const result = detector.check(error2);

    expect(result.detected).toBe(false);
  });
});
