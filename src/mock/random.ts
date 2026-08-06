/** Deterministic pseudo-random helpers so mock data is stable across renders. */
export function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export const pick = <T>(rng: () => number, arr: T[]): T =>
  arr[Math.floor(rng() * arr.length) % arr.length] as T;

export const intBetween = (rng: () => number, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

export const uid = (prefix: string, n: number) => `${prefix}-${String(n).padStart(5, "0")}`;

/** Last N periods ending at the given month/year (inclusive). */
export function lastPeriods(month: number, year: number, count: number) {
  const out: { month: number; year: number }[] = [];
  let m = month;
  let y = year;
  for (let i = 0; i < count; i++) {
    out.unshift({ month: m, year: y });
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}
