/**
 * Pure tournament scoring helpers (no Nest / Prisma imports) so they can be
 * unit-tested in isolation.
 */

export const HOLES = 18;
export const MIN_STROKES = 1;
export const MAX_STROKES = 15;

/** Default par layout used by the dashboard (holes 1..18). */
export const DEFAULT_PARS: number[] = [
  4, 3, 4, 5, 4, 4, 3, 4, 5, // 1-9
  4, 3, 4, 4, 5, 4, 3, 5, 4, // 10-18
];

export function resolvePars(raw: unknown): number[] {
  if (
    Array.isArray(raw) &&
    raw.length === HOLES &&
    raw.every((p) => Number.isInteger(p) && p >= 3 && p <= 6)
  ) {
    return raw as number[];
  }
  return DEFAULT_PARS;
}

export class ScoreValidationError extends Error {}

/** Throws ScoreValidationError when the hole / stroke values are not acceptable. */
export function assertValidScore(hole: unknown, strokes: unknown, isOut: boolean) {
  if (!Number.isInteger(hole) || (hole as number) < 1 || (hole as number) > HOLES) {
    throw new ScoreValidationError(`Hole harus 1-${HOLES}.`);
  }
  if (isOut) return;
  if (strokes === null || strokes === undefined) return; // clearing a score
  if (!Number.isInteger(strokes)) {
    throw new ScoreValidationError('Skor harus angka bulat.');
  }
  const s = strokes as number;
  if (s < MIN_STROKES || s > MAX_STROKES) {
    throw new ScoreValidationError(`Skor harus antara ${MIN_STROKES} dan ${MAX_STROKES}.`);
  }
}

/** 3-digit numeric tournament code that is not in `taken`. */
export function generateTournamentCode(taken: Set<string>, rand: () => number = Math.random): string {
  for (let i = 0; i < 2000; i++) {
    const code = String(100 + Math.floor(rand() * 900));
    if (!taken.has(code)) return code;
  }
  throw new Error('Tidak ada kode turnamen yang tersedia.');
}

export function normalizeCode(input: unknown): string {
  return String(input ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

/** Flight input "07" / "7" -> "7". Non-numeric legacy codes are returned normalised. */
export function normalizeFlightCode(input: unknown): string {
  const c = normalizeCode(input);
  return /^\d+$/.test(c) ? String(parseInt(c, 10)) : c;
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export interface ScoreRow {
  playerId: string;
  hole: number;
  strokes: number | null;
  isOut: boolean;
  status: 'ENTERED' | 'VALIDATED';
}

export interface PlayerRow {
  id: string;
  name: string;
  code?: string | null;
  flight: string; // category A/B/C
  handicap: number;
  groupCode?: string | null;
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  code: string | null;
  flight: string;
  handicap: number;
  groupCode: string | null;
  gross: number;
  toPar: number;
  holesPlayed: number;
  validatedHoles: number;
  pendingHoles: number;
  isOut: boolean;
  isFinished: boolean;
  /** Back 9 / last 6 / last 3 / last 1 (holes 10-18) gross, used for countback. */
  countback: [number, number, number, number];
  position: number | null;
  positionLabel: string; // "1", "T3", "OUT", "-"
  categoryPosition: number | null;
  categoryPositionLabel: string;
  holes: Array<{ hole: number; strokes: number | null; isOut: boolean; status: string } | null>;
}

function sumHoles(byHole: Map<number, ScoreRow>, from: number, to: number) {
  let t = 0;
  for (let h = from; h <= to; h++) {
    const r = byHole.get(h);
    if (r && !r.isOut && r.status === 'VALIDATED' && typeof r.strokes === 'number') t += r.strokes;
  }
  return t;
}

/** Negative = a ranks better than b. 0 = genuine tie. */
export function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  const bucket = (e: LeaderboardEntry) => (e.isOut ? 2 : e.holesPlayed === 0 ? 1 : 0);
  const ba = bucket(a);
  const bb = bucket(b);
  if (ba !== bb) return ba - bb;
  if (ba !== 0) return 0;

  // Live ranking: score relative to par on holes played.
  if (a.toPar !== b.toPar) return a.toPar - b.toPar;
  // More holes completed ranks higher on equal to-par.
  if (a.holesPlayed !== b.holesPlayed) return b.holesPlayed - a.holesPlayed;
  // Countback (only meaningful when both finished): back 9, last 6, last 3, last hole.
  if (a.isFinished && b.isFinished) {
    for (let i = 0; i < 4; i++) {
      if (a.countback[i] !== b.countback[i]) return a.countback[i] - b.countback[i];
    }
  }
  return 0;
}

function assignPositions(
  list: LeaderboardEntry[],
  set: (e: LeaderboardEntry, pos: number | null, label: string) => void,
) {
  const sorted = [...list].sort((a, b) => compareEntries(a, b) || a.name.localeCompare(b.name));
  let i = 0;
  while (i < sorted.length) {
    const e = sorted[i];
    if (e.isOut || e.holesPlayed === 0) {
      set(e, null, e.isOut ? 'OUT' : '-');
      i++;
      continue;
    }
    let j = i + 1;
    while (j < sorted.length && compareEntries(sorted[i], sorted[j]) === 0) j++;
    const pos = i + 1;
    const tied = j - i > 1;
    for (let k = i; k < j; k++) set(sorted[k], pos, tied ? `T${pos}` : String(pos));
    i = j;
  }
  return sorted;
}

export function buildLeaderboard(
  players: PlayerRow[],
  scores: ScoreRow[],
  pars: number[] = DEFAULT_PARS,
): LeaderboardEntry[] {
  const byPlayer = new Map<string, Map<number, ScoreRow>>();
  for (const s of scores) {
    if (!byPlayer.has(s.playerId)) byPlayer.set(s.playerId, new Map());
    byPlayer.get(s.playerId)!.set(s.hole, s);
  }

  const entries: LeaderboardEntry[] = players.map((p) => {
    const byHole = byPlayer.get(p.id) || new Map<number, ScoreRow>();
    let gross = 0;
    let toPar = 0;
    let holesPlayed = 0;
    let validatedHoles = 0;
    let pendingHoles = 0;
    let isOut = false;
    const holes: LeaderboardEntry['holes'] = [];
    for (let h = 1; h <= HOLES; h++) {
      const r = byHole.get(h);
      if (!r) {
        holes.push(null);
        continue;
      }
      holes.push({ hole: h, strokes: r.strokes, isOut: r.isOut, status: r.status });
      if (r.isOut) {
        isOut = true;
        continue;
      }
      if (typeof r.strokes === 'number') {
        // Only scores confirmed by the player (or set by a marshal) count for ranking.
        if (r.status === 'VALIDATED') {
          gross += r.strokes;
          toPar += r.strokes - pars[h - 1];
          holesPlayed++;
          validatedHoles++;
        } else {
          pendingHoles++;
        }
      }
    }
    return {
      playerId: p.id,
      name: p.name,
      code: p.code ?? null,
      flight: p.flight,
      handicap: p.handicap,
      groupCode: p.groupCode ?? null,
      gross,
      toPar,
      holesPlayed,
      validatedHoles,
      pendingHoles,
      isOut,
      isFinished: !isOut && holesPlayed === HOLES,
      countback: [
        sumHoles(byHole, 10, 18),
        sumHoles(byHole, 13, 18),
        sumHoles(byHole, 16, 18),
        sumHoles(byHole, 18, 18),
      ],
      position: null,
      positionLabel: '-',
      categoryPosition: null,
      categoryPositionLabel: '-',
      holes,
    };
  });

  const sorted = assignPositions(entries, (e, pos, label) => {
    e.position = pos;
    e.positionLabel = label;
  });

  const categories = new Map<string, LeaderboardEntry[]>();
  for (const e of entries) {
    const key = e.flight || '-';
    if (!categories.has(key)) categories.set(key, []);
    categories.get(key)!.push(e);
  }
  for (const list of categories.values()) {
    assignPositions(list, (e, pos, label) => {
      e.categoryPosition = pos;
      e.categoryPositionLabel = label;
    });
  }

  return sorted;
}

// ---------------------------------------------------------------------------
// Legacy shape used by the existing dashboard/tablet UI
// (scores.IN = holes 1-9, scores.OUT = holes 10-18)
// ---------------------------------------------------------------------------

export interface LegacyScoreRow extends ScoreRow {
  editedByMarshal: boolean;
  version: number;
}

export function toLegacyPlayer<T extends { id: string }>(player: T, rows: LegacyScoreRow[]) {
  const scores = { IN: Array<number | string>(9).fill(0), OUT: Array<number | string>(9).fill(0) };
  const approvals = { IN: Array<boolean>(9).fill(false), OUT: Array<boolean>(9).fill(false) };
  const marshalEdited = { IN: Array<boolean>(9).fill(false), OUT: Array<boolean>(9).fill(false) };
  const versions = { IN: Array<number>(9).fill(0), OUT: Array<number>(9).fill(0) };
  for (const r of rows) {
    if (r.hole < 1 || r.hole > HOLES) continue;
    const nine = r.hole <= 9 ? 'IN' : 'OUT';
    const idx = (r.hole - 1) % 9;
    scores[nine][idx] = r.isOut ? 'OUT' : (r.strokes ?? 0);
    approvals[nine][idx] = r.status === 'VALIDATED';
    marshalEdited[nine][idx] = r.editedByMarshal;
    versions[nine][idx] = r.version;
  }
  return { ...player, manualTotal: null, scores, approvals, marshalEdited, versions };
}
