import { flightProgress, holeOrder, HoleState } from './tournament-scoring';

const state = (map: Record<string, Record<number, HoleState>>) => (p: string, h: number) =>
  map[p]?.[h] ?? { hasScore: false, done: false };

describe('hole sequence', () => {
  it('wraps the play order around the start hole', () => {
    expect(holeOrder(6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 1, 2, 3, 4, 5]);
    expect(holeOrder(1)[17]).toBe(18);
    expect(holeOrder(99)[0]).toBe(1);
  });

  it('starts at the start hole before any score', () => {
    const p = flightProgress(6, ['a', 'b'], state({}));
    expect(p).toMatchObject({ currentHole: 6, holesDone: 0, started: false, awaitingConfirmation: false });
  });

  it('stays on a hole until every player is confirmed', () => {
    const p = flightProgress(
      6,
      ['a', 'b'],
      state({ a: { 6: { hasScore: true, done: true } }, b: { 6: { hasScore: true, done: false } } }),
    );
    expect(p).toMatchObject({ currentHole: 6, awaitingConfirmation: true, started: true });
  });

  it('advances past confirmed holes and reports finished', () => {
    const all: Record<number, HoleState> = {};
    for (let h = 1; h <= 18; h++) all[h] = { hasScore: true, done: true };
    expect(flightProgress(6, ['a'], state({ a: { 6: all[6], 7: all[7] } }))).toMatchObject({ currentHole: 8, holesDone: 2 });
    expect(flightProgress(6, ['a'], state({ a: all }))).toMatchObject({ currentHole: null, finished: true, holesDone: 18 });
  });
});
