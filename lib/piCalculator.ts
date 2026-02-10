/**
 * Bailey–Borwein–Plouffe (BBP) formula for Pi calculation
 * https://en.wikipedia.org/wiki/Bailey%E2%80%93Borwein%E2%80%93Plouffe_formula
 */

export class PiCalculator {
  private static readonly PRECISION = 1000; // Decimal places

  /**
   * Compute Pi using BBP formula
   * @param digits Number of decimal places to compute
   * @returns Pi as string with specified precision
   */
  static computeDigits(digits: number = 50): Promise<string> {
    return new Promise((resolve) => {
      // Run in microtask to prevent blocking
      setTimeout(() => {
        const iterations = Math.min(digits, 100); // Cap for performance
        let pi = 0;

        for (let k = 0; k < iterations; k++) {
          const term =
            (1 / Math.pow(16, k)) *
            (4 / (8 * k + 1) -
              2 / (8 * k + 4) -
              1 / (8 * k + 5) -
              1 / (8 * k + 6));
          pi += term;
        }

        // Format to specified decimal places
        const piString = pi.toFixed(Math.min(digits, 100));
        resolve(piString);
      }, 0);
    });
  }

  /**
   * Compute Pi with Web Worker for heavy computation
   */
  static computeDigitsWorker(digits: number): Promise<string> {
    // For now, use main thread computation
    // TODO: Implement Web Worker for heavy Pi calculations
    return this.computeDigits(digits);
  }

  /**
   * Generate Pi digits progressively for real-time display
   */
  static *generateDigits(iterations: number = 100): Generator<string> {
    let pi = 0;
    for (let k = 0; k < iterations; k++) {
      pi +=
        (1 / Math.pow(16, k)) *
        (4 / (8 * k + 1) - 2 / (8 * k + 4) - 1 / (8 * k + 5) - 1 / (8 * k + 6));
      yield pi.toFixed(Math.min(k + 1, 100));
    }
  }
}

// Quick test function
export function testBBPFormula(): void {
  const pi = PiCalculator.computeDigits(10);
  console.log("BBP Pi (10 digits):", pi);
}
