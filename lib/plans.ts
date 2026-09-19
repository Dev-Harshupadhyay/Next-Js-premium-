import type { Pack, PackId, PlanDuration, PlanItem } from "./types";

/**
 * Plans ported 1:1 from the original single-file site.
 * Razorpay payment-button ids preserved.
 */
export const PACKS: Record<PackId, Pack> = {
  movies: {
    id: "movies",
    name: "Movies Pack",
    emoji: "🎬",
    subtitle: "Movies & Series",
    tagline: "ALL OTT CONTENT",
    items: [
      { n: "1 Month", p: 50, b: "pl_TcjHF0nZXCtlQO" },
      { n: "3 Months", p: 250, b: "pl_TcjLIqo5ZVvgaY" },
      { n: "6 Months", p: 420, b: "pl_TcjMhB31QXHseK", hot: true },
      { n: "1 Year", p: 465, b: "pl_TcjSAK86Q3OvuC" },
    ],
  },
  adult: {
    id: "adult",
    name: "Adult Pack",
    emoji: "🔞",
    subtitle: "Adult Pack",
    tagline: "SINGLE CHANNEL",
    items: [
      { n: "1 Month", p: 70, b: "pl_TcjTf9vUvIvA3z" },
      { n: "3 Months", p: 200, b: "pl_TcjUc3CEAccAtz" },
      { n: "6 Months", p: 410, b: "pl_TcjVWEUWynhZ0s" },
      { n: "1 Year", p: 835, b: "pl_TcjW9QKyHKuxPG" },
    ],
  },
  combo: {
    id: "combo",
    name: "Combo Pack",
    emoji: "🌟",
    subtitle: "Combo Pack",
    tagline: "MOVIES + ADULT",
    featured: true,
    items: [
      { n: "1 Month", p: 220 },
      { n: "3 Months", p: 450 },
      { n: "6 Months", p: 630 },
      { n: "1 Year", p: 1030, hot: true },
    ],
  },
};

export const PACK_LIST: Pack[] = [PACKS.movies, PACKS.adult, PACKS.combo];

export const MONTHS: Record<PlanDuration, number> = {
  "1 Month": 1,
  "3 Months": 3,
  "6 Months": 6,
  "1 Year": 12,
};

export function isPackId(value: string): value is PackId {
  return value === "movies" || value === "adult" || value === "combo";
}

export function getPack(id: string): Pack | null {
  return isPackId(id) ? PACKS[id] : null;
}

export function findPlan(pack: PackId, duration: string): PlanItem | null {
  return PACKS[pack].items.find((item) => item.n === duration) ?? null;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Per-month effective price — used for the "save X%" badges. */
export function perMonth(item: PlanItem): number {
  return Math.round(item.p / MONTHS[item.n]);
}

export function savingsPercent(pack: Pack, item: PlanItem): number {
  const base = pack.items[0];
  if (!base || item.n === base.n) return 0;
  const baseMonthly = base.p / MONTHS[base.n];
  const thisMonthly = item.p / MONTHS[item.n];
  return Math.max(0, Math.round((1 - thisMonthly / baseMonthly) * 100));
}
