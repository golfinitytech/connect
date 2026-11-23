import { useCallback, useEffect, useState } from 'react';

/**
 * Configurable tournament flight / auto-grouping rules (admin side).
 * Used by Create Tournament and Tournament Players so both group the same way.
 */

export type FlightRule = {
  id: string; // short code shown on badges, e.g. "A"
  label: string; // e.g. "Flight A"
  minHcp: number;
  maxHcp: number;
  /** Flights with the same pool number may share a group. */
  pool: number;
};

/**
 * How mixed groups (players from different flights) may be composed. "Higher" = the flight
 * with the higher handicap range (B is higher than A).
 * - free:                 any mix
 * - noLoneHigher:         a group of 4+ may not have exactly 1 higher-flight player (no 3A + 1B)
 * - higherAtLeastLower:   the higher flight must have at least as many players (no 2A + 1B)
 */
export type MixRule = 'free' | 'noLoneHigher' | 'higherAtLeastLower';

export type GroupingRules = {
  flights: FlightRule[];
  minPerGroup: number;
  maxPerGroup: number;
  mixRule: MixRule;
  /** Players that must play together; each entry is a list of player names. */
  fixedGroups: string[][];
};

export const DEFAULT_GROUPING_RULES: GroupingRules = {
  flights: [
    { id: 'A', label: 'Flight A', minHcp: 1, maxHcp: 13, pool: 1 },
    { id: 'B', label: 'Flight B', minHcp: 14, maxHcp: 21, pool: 1 },
    { id: 'C', label: 'Flight C', minHcp: 22, maxHcp: 28, pool: 2 },
  ],
  minPerGroup: 2,
  maxPerGroup: 4,
  mixRule: 'noLoneHigher',
  fixedGroups: [],
};

export const MIX_RULE_LABEL: Record<MixRule, string> = {
  free: 'Bebas (komposisi apa saja)',
  noLoneHigher: 'Dilarang 1 pemain flight HCP lebih tinggi sendirian di grup 4 (contoh: 3A + 1B)',
  higherAtLeastLower: 'Flight HCP lebih tinggi minimal sama banyak (contoh: 2A + 1B dilarang)',
};

const hcpOf = (p: { handicap?: unknown }) => {
  const n = parseInt(String(p?.handicap ?? ''), 10);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Flight for a handicap: the range containing it, else the nearest end of the table.
 * A blank handicap goes to the last (highest) flight, as before.
 */
export function assignFlight(handicap: unknown, rules: GroupingRules): string {
  const flights = sortedFlights(rules);
  if (!flights.length) return '';
  if (String(handicap ?? '').trim() === '') return flights[flights.length - 1].id;
  const hcp = hcpOf({ handicap });
  const hit = flights.find((f) => hcp >= f.minHcp && hcp <= f.maxHcp);
  if (hit) return hit.id;
  return hcp < flights[0].minHcp ? flights[0].id : flights[flights.length - 1].id;
}

export const sortedFlights = (rules: GroupingRules) =>
  [...rules.flights].sort((a, b) => a.minHcp - b.minHcp || a.id.localeCompare(b.id));

/** Problems in the rules themselves (shown in the editor). */
export function validateRules(rules: GroupingRules): string[] {
  const out: string[] = [];
  const flights = sortedFlights(rules);
  if (!flights.length) out.push('Minimal harus ada 1 flight.');
  const ids = new Set<string>();
  flights.forEach((f, i) => {
    if (!f.id.trim()) out.push('Kode flight tidak boleh kosong.');
    if (ids.has(f.id)) out.push(`Kode flight "${f.id}" dipakai lebih dari sekali.`);
    ids.add(f.id);
    if (f.minHcp > f.maxHcp) out.push(`${f.label}: HCP minimal lebih besar dari maksimal.`);
    const next = flights[i + 1];
    if (next && next.minHcp <= f.maxHcp) out.push(`Rentang HCP ${f.label} dan ${next.label} tumpang tindih.`);
    if (next && next.minHcp > f.maxHcp + 1) out.push(`HCP ${f.maxHcp + 1}-${next.minHcp - 1} tidak masuk flight mana pun (masuk ke flight terdekat).`);
  });
  if (rules.minPerGroup < 1) out.push('Minimal pemain per grup harus 1 atau lebih.');
  if (rules.maxPerGroup < rules.minPerGroup) out.push('Maksimal pemain per grup harus ≥ minimal.');
  return out;
}

/** Human-readable summary of the rules. */
export function describeRules(rules: GroupingRules): string[] {
  const flights = sortedFlights(rules);
  const pools = new Map<number, FlightRule[]>();
  flights.forEach((f) => pools.set(f.pool, [...(pools.get(f.pool) ?? []), f]));
  const lines = flights.map((f) => `${f.label}: HCP ${f.minHcp}-${f.maxHcp}`);
  pools.forEach((fs) => {
    lines.push(
      fs.length > 1
        ? `${fs.map((f) => f.label).join(' & ')} boleh satu grup`
        : `${fs[0].label} hanya dengan sesama ${fs[0].label}`,
    );
  });
  if (rules.mixRule !== 'free') lines.push(MIX_RULE_LABEL[rules.mixRule]);
  lines.push(`Minimal ${rules.minPerGroup} & maksimal ${rules.maxPerGroup} pemain per grup`);
  if (rules.fixedGroups.length) lines.push(`${rules.fixedGroups.length} grup tetap (pemain wajib satu grup)`);
  return lines;
}

/** True when a group breaks the mix rule. */
export function violatesMixRule(group: { flight?: string }[], rules: GroupingRules): boolean {
  if (rules.mixRule === 'free') return false;
  const order = sortedFlights(rules).map((f) => f.id);
  const counts = new Map<string, number>();
  group.forEach((p) => counts.set(p.flight ?? '', (counts.get(p.flight ?? '') ?? 0) + 1));
  if (counts.size < 2) return false;
  const hi = [...counts.keys()].sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
  const hiCount = counts.get(hi) ?? 0;
  const others = group.length - hiCount;
  if (rules.mixRule === 'noLoneHigher') return group.length >= 4 && hiCount === 1;
  return hiCount < others; // higherAtLeastLower
}

const nameKey = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '');

/** Evenly sized chunks between min and max (e.g. 10 players, max 4 -> 4,3,3). */
function splitSizes(n: number, max: number): number[] {
  if (n <= 0) return [];
  const g = Math.ceil(n / Math.max(1, max));
  const base = Math.floor(n / g);
  const extra = n % g;
  return Array.from({ length: g }, (_, i) => base + (i < extra ? 1 : 0));
}

/**
 * Auto-group players by the rules. Returns the groups (players get `flight` set) and
 * warnings for anything the rules could not satisfy (e.g. a pool with 1 player).
 */
export function autoGroup<P extends { name?: string; handicap?: unknown }>(
  players: P[],
  rules: GroupingRules,
): { groups: (P & { flight: string })[][]; warnings: string[] } {
  const warnings: string[] = [];
  const order = sortedFlights(rules);
  const withFlight = players.map((p) => ({ ...p, flight: assignFlight(p.handicap, rules) }));
  const pool = [...withFlight];
  const groups: (P & { flight: string })[][] = [];

  // 1. Fixed groups first (names matched loosely: "Luky" matches "Om Luky").
  rules.fixedGroups.forEach((names, i) => {
    const picked: typeof withFlight = [];
    names.forEach((n) => {
      const key = nameKey(n);
      if (!key) return;
      const idx = pool.findIndex((p) => {
        const pk = nameKey(p.name ?? '');
        return pk && (pk === key || pk.includes(key) || key.includes(pk));
      });
      if (idx === -1) warnings.push(`Grup tetap ${i + 1}: pemain "${n}" tidak ditemukan.`);
      else picked.push(pool.splice(idx, 1)[0]);
    });
    if (picked.length > rules.maxPerGroup) warnings.push(`Grup tetap ${i + 1} berisi ${picked.length} pemain (> maksimal ${rules.maxPerGroup}).`);
    if (picked.length) groups.push(picked);
  });

  // 2. Each pool of mixable flights is grouped separately.
  const poolIds = [...new Set(order.map((f) => f.pool))].sort((a, b) => a - b);
  for (const poolId of poolIds) {
    const flightIds = order.filter((f) => f.pool === poolId).map((f) => f.id);
    // Higher-handicap flights first keeps them together, which avoids lone players.
    const members = pool
      .filter((p) => flightIds.includes(p.flight))
      .sort((a, b) => flightIds.indexOf(b.flight) - flightIds.indexOf(a.flight));
    if (!members.length) continue;
    const label = order.filter((f) => f.pool === poolId).map((f) => f.label).join(' & ');

    const poolGroups: typeof groups = [];
    let cursor = 0;
    for (const size of splitSizes(members.length, rules.maxPerGroup)) {
      poolGroups.push(members.slice(cursor, cursor + size));
      cursor += size;
    }
    if (members.length < rules.minPerGroup) {
      warnings.push(`${label}: hanya ${members.length} pemain, kurang dari minimal ${rules.minPerGroup} per grup.`);
    }

    // 3. Repair mix-rule violations by swapping players between groups of this pool.
    for (let pass = 0; pass < 6; pass++) {
      let changed = false;
      for (let gi = 0; gi < poolGroups.length; gi++) {
        const g = poolGroups[gi];
        if (!violatesMixRule(g, rules)) continue;
        outer: for (let hi = 0; hi < poolGroups.length; hi++) {
          if (hi === gi) continue;
          const h = poolGroups[hi];
          for (let x = 0; x < g.length; x++) {
            for (let y = 0; y < h.length; y++) {
              if (g[x].flight === h[y].flight) continue;
              const g2 = [...g];
              const h2 = [...h];
              [g2[x], h2[y]] = [h2[y], g2[x]];
              if (!violatesMixRule(g2, rules) && !violatesMixRule(h2, rules)) {
                poolGroups[gi] = g2;
                poolGroups[hi] = h2;
                changed = true;
                break outer;
              }
            }
          }
        }
      }
      if (!changed) break;
    }
    poolGroups.forEach((g, i) => {
      if (violatesMixRule(g, rules)) {
        warnings.push(`${label} grup ${i + 1} (${g.map((p) => p.flight).join('+')}) melanggar aturan komposisi; atur manual bila perlu.`);
      }
    });
    groups.push(...poolGroups);
  }

  return { groups, warnings };
}

// ── Persistence (per admin browser) ───────────────────────────────────────────

const STORAGE_KEY = 'tournament_grouping_rules_v1';

export function loadGroupingRules(): GroupingRules {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GROUPING_RULES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.flights)) return DEFAULT_GROUPING_RULES;
    return { ...DEFAULT_GROUPING_RULES, ...parsed };
  } catch {
    return DEFAULT_GROUPING_RULES;
  }
}

/** Rules state shared by every page that groups players; saved to localStorage. */
export function useGroupingRules() {
  const [rules, setRulesState] = useState<GroupingRules>(loadGroupingRules);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setRulesState(loadGroupingRules());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const setRules = useCallback((next: GroupingRules) => {
    setRulesState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: keep in memory */
    }
  }, []);
  return [rules, setRules] as const;
}
