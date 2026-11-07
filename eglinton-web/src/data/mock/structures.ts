/** Demo blind structures. Replace with the club's published structures. */
import type { BlindLevel, TournamentStructure } from "@/domain/schemas";

const HOLDEM_LADDER: [number, number][] = [
  [100, 100], [100, 200], [200, 300], [200, 400], [300, 600], [400, 800],
  [500, 1000], [600, 1200], [800, 1600], [1000, 2000], [1500, 3000], [2000, 4000],
  [3000, 6000], [4000, 8000], [5000, 10000], [6000, 12000], [8000, 16000], [10000, 20000],
  [15000, 30000], [20000, 40000],
];

const OMAHA_LADDER: [number, number][] = [
  [100, 100], [100, 200], [150, 300], [200, 400], [300, 600], [400, 800],
  [500, 1000], [600, 1200], [800, 1600], [1000, 2000], [1200, 2400], [1500, 3000],
  [2000, 4000], [2500, 5000], [3000, 6000], [4000, 8000], [5000, 10000], [6000, 12000],
];

function build(
  id: string,
  name: string,
  minutes: number,
  ladder: [number, number][],
  options: { anteFrom?: number; breakEvery: number; breakMinutes: number }
): TournamentStructure {
  const levels: BlindLevel[] = [];
  ladder.forEach(([sb, bb], i) => {
    const level = i + 1;
    levels.push({
      kind: "level",
      level,
      smallBlind: sb,
      bigBlind: bb,
      ante: options.anteFrom && level >= options.anteFrom ? bb : 0,
      minutes,
    });
    if (level % options.breakEvery === 0 && level < ladder.length) {
      levels.push({
        kind: "break",
        minutes: options.breakMinutes,
        label: level === options.breakEvery ? "Break · add-on & chip-up" : "Break · chip-up",
      });
    }
  });
  return { id, name, levelMinutes: minutes, levels };
}

export const STRUCTURES: TournamentStructure[] = [
  build("deepstack-20", "Deepstack · 20-minute levels", 20, HOLDEM_LADDER, { anteFrom: 5, breakEvery: 6, breakMinutes: 15 }),
  build("deepstack-25", "Deepstack · 25-minute levels", 25, HOLDEM_LADDER, { anteFrom: 5, breakEvery: 6, breakMinutes: 15 }),
  build("deepstack-30", "Festival · 30-minute levels", 30, HOLDEM_LADDER, { anteFrom: 5, breakEvery: 4, breakMinutes: 15 }),
  build("standard-15", "Standard · 15-minute levels", 15, HOLDEM_LADDER.slice(1), { anteFrom: 5, breakEvery: 6, breakMinutes: 10 }),
  build("turbo-10", "Turbo · 10-minute levels", 10, HOLDEM_LADDER.slice(2), { anteFrom: 4, breakEvery: 4, breakMinutes: 10 }),
  build("omaha-20", "Pot-Limit Omaha · 20-minute levels", 20, OMAHA_LADDER, { breakEvery: 6, breakMinutes: 15 }),
];

export const STRUCTURE_BY_ID = new Map(STRUCTURES.map((s) => [s.id, s]));

/** Rough running time, used only to derive demo statuses. */
export function estimatedHours(structureId: string): number {
  switch (structureId) {
    case "turbo-10":
      return 3.5;
    case "standard-15":
      return 4.5;
    case "deepstack-30":
      return 9;
    default:
      return 6;
  }
}

/** Minutes from start until late registration closes (levels + breaks). */
export function minutesUntilEndOfLevel(structureId: string, level: number): number {
  const s = STRUCTURE_BY_ID.get(structureId);
  if (!s) return 0;
  let total = 0;
  for (const l of s.levels) {
    total += l.minutes;
    if (l.kind === "level" && l.level === level) break;
  }
  return total;
}
