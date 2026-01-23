import crypto from "node:crypto";

export class CircularFixDetector {
  private errorHistory: Map<string, number> = new Map(); // hash -> count
  private readonly THRESHOLD = 3;

  /**
   * Generates a hash for the error output (using first 500 chars).
   */
  private hashError(errorOutput: string): string {
    return crypto
      .createHash("sha256")
      .update(errorOutput.slice(0, 500))
      .digest("hex");
  }

  /**
   * Checks if the error has been seen before and increments the count.
   */
  check(errorOutput: string): { detected: boolean; count: number } {
    const hash = this.hashError(errorOutput);
    const count = (this.errorHistory.get(hash) || 0) + 1;
    this.errorHistory.set(hash, count);

    return {
      detected: count >= this.THRESHOLD,
      count,
    };
  }

  reset() {
    this.errorHistory.clear();
  }
}
