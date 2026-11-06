/** Deterministic pseudo-random helpers so demo data is stable between requests. */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 */
export function rng(seed: number | string) {
  let a = typeof seed === "string" ? hashString(seed) : seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof rng>;

export function between(r: Rng, min: number, max: number) {
  return min + r() * (max - min);
}

/** Weighted sample of `count` distinct items. */
export function weightedSample<T>(r: Rng, items: T[], weight: (t: T) => number, count: number): T[] {
  const pool = items.map((item) => ({ item, w: Math.max(weight(item), 0.0001) }));
  const out: T[] = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let pick = r() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      pick -= pool[idx].w;
      if (pick <= 0) break;
    }
    idx = Math.min(idx, pool.length - 1);
    out.push(pool[idx].item);
    pool.splice(idx, 1);
  }
  return out;
}
