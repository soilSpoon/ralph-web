export interface ICircularFixDetector {
  check(errorOutput: string): { detected: boolean; similarity: number };
  reset(): void;
}

export class CircularFixDetector implements ICircularFixDetector {
  private errorHistory: string[] = [];
  private readonly SIMILARITY_THRESHOLD = 0.3; // Jaccard similarity threshold
  private readonly REPETITION_THRESHOLD = 2; // Number of similar errors before detection

  /**
   * Calculates Jaccard Similarity between two strings.
   */
  private calculateJaccard(s1: string, s2: string): number {
    const set1 = new Set(s1.toLowerCase().split(/\s+/));
    const set2 = new Set(s2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Checks if the error is similar to past errors.
   */
  check(errorOutput: string): { detected: boolean; similarity: number } {
    let maxSimilarity = 0;
    let occurrences = 1;

    for (const pastError of this.errorHistory) {
      const sim = this.calculateJaccard(errorOutput, pastError);
      if (sim > maxSimilarity) maxSimilarity = sim;

      if (sim >= this.SIMILARITY_THRESHOLD) {
        occurrences++;
      }
    }

    this.errorHistory.push(errorOutput);

    return {
      detected: occurrences >= this.REPETITION_THRESHOLD,
      similarity: maxSimilarity,
    };
  }

  reset() {
    this.errorHistory = [];
  }
}
