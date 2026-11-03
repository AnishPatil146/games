export interface Stopwatch {
  reset: () => void;
  elapsedMs: (minMs?: number) => number;
}

export function createStopwatch(): Stopwatch {
  let startedAt = 0;
  return {
    reset() {
      startedAt = typeof performance !== "undefined" ? performance.now() : 0;
    },
    elapsedMs(minMs: number = 100) {
      if (typeof performance === "undefined" || startedAt <= 0) {
        return minMs;
      }
      return Math.max(minMs, Math.round(performance.now() - startedAt));
    },
  };
}
