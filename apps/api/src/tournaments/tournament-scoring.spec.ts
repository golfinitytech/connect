import assert from 'node:assert/strict';
import { buildLeaderboard, assertValidScore, generateTournamentCode, normalizeFlightCode, toLegacyPlayer, DEFAULT_PARS, ScoreValidationError } from './tournament-scoring';

describe('tournament scoring', () => {
  it('ranks, validates and maps scores correctly', () => {

    const full = (pid: string, arr: number[], status: any = 'VALIDATED') => arr.map((s, i) => ({ playerId: pid, hole: i + 1, strokes: s, isOut: false, status }));
    const par = DEFAULT_PARS;
    const pl = (id: string, flight = 'A') => ({ id, name: id, flight, handicap: 10 });

    // 1. Basic gross ranking
    let lb = buildLeaderboard([pl('a'), pl('b')], [...full('a', par.map(p => p + 1)), ...full('b', par)]);
    assert.equal(lb[0].playerId, 'b'); assert.equal(lb[0].positionLabel, '1'); assert.equal(lb[0].gross, 72); assert.equal(lb[0].toPar, 0);
    assert.equal(lb[1].gross, 90); assert.equal(lb[1].toPar, 18);

    // 2. Tie with countback: same total 72, b better on back nine
    const aS = [...par]; aS[0] -= 1; aS[17] += 1; // birdie 1, bogey 18
    const bS = [...par]; bS[0] += 1; bS[17] -= 1; // bogey 1, birdie 18
    lb = buildLeaderboard([pl('a'), pl('b')], [...full('a', aS), ...full('b', bS)]);
    assert.equal(lb[0].playerId, 'b', 'countback back 9'); assert.equal(lb[0].positionLabel, '1'); assert.equal(lb[1].positionLabel, '2');

    // 3. Exact tie -> T1
    lb = buildLeaderboard([pl('a'), pl('b'), pl('c')], [...full('a', par), ...full('b', par), ...full('c', par.map(p=>p+1))]);
    assert.deepEqual(lb.map(e => e.positionLabel), ['T1', 'T1', '3']);

    // 4. Live: to-par on holes played; OUT & not started at bottom
    const partial = full('p', [3, 3, 3]); // -1,0,-1 => -2 after 3 holes
    const outRows = [...full('o', [4]), { playerId: 'o', hole: 2, strokes: null, isOut: true, status: 'VALIDATED' }];
    lb = buildLeaderboard([pl('n'), pl('o'), pl('p'), pl('f')], [...partial, ...outRows, ...full('f', par)]);
    assert.deepEqual(lb.map(e => e.playerId), ['p', 'f', 'n', 'o']);
    assert.equal(lb[0].toPar, -2); assert.equal(lb[2].positionLabel, '-'); assert.equal(lb[3].positionLabel, 'OUT');

    // 5. Category positions
    lb = buildLeaderboard([pl('a','A'), pl('b','B'), pl('c','B')], [...full('a', par), ...full('b', par.map(p=>p+1)), ...full('c', par.map(p=>p+2))]);
    const byId = Object.fromEntries(lb.map(e => [e.playerId, e]));
    assert.equal(byId.b.positionLabel, '2'); assert.equal(byId.b.categoryPositionLabel, '1'); assert.equal(byId.c.categoryPositionLabel, '2');

    // 6. pending counts
    lb = buildLeaderboard([pl('a')], full('a', [4,3], 'ENTERED'));
    assert.equal(lb[0].pendingHoles, 2); assert.equal(lb[0].validatedHoles, 0); assert.equal(lb[0].gross, 0); assert.equal(lb[0].holesPlayed, 0); assert.equal(lb[0].positionLabel, '-');

    // 6b. unconfirmed score must not move ranking
lb = buildLeaderboard([pl('a'), pl('b')], [...full('a', [4]), ...full('b', [3]), { playerId: 'a', hole: 2, strokes: 1, isOut: false, status: 'ENTERED' }]);
assert.equal(lb[0].playerId, 'b'); assert.equal(lb[1].gross, 4); assert.equal(lb[1].pendingHoles, 1);
// 7. validation
    assert.throws(() => assertValidScore(0, 4, false), ScoreValidationError);
    assert.throws(() => assertValidScore(19, 4, false), ScoreValidationError);
    assert.throws(() => assertValidScore(1, 0, false), ScoreValidationError);
    assert.throws(() => assertValidScore(1, 16, false), ScoreValidationError);
    assert.throws(() => assertValidScore(1, 4.5, false), ScoreValidationError);
    assertValidScore(1, 15, false); assertValidScore(1, null, false); assertValidScore(18, null, true);

    // 8. codes
    const taken = new Set<string>(); for (let i = 0; i < 300; i++) { const c = generateTournamentCode(taken); assert.match(c, /^\d{3}$/); assert.ok(!taken.has(c)); taken.add(c); }
    assert.equal(normalizeFlightCode(' 07 '), '7'); assert.equal(normalizeFlightCode('12'), '12'); assert.equal(normalizeFlightCode('gf-open-1'), 'GF-OPEN-1');

    // 9. legacy shape
    const lp = toLegacyPlayer({ id: 'x' }, [
      { playerId: 'x', hole: 1, strokes: 5, isOut: false, status: 'VALIDATED', editedByMarshal: false, version: 2 },
      { playerId: 'x', hole: 10, strokes: null, isOut: true, status: 'VALIDATED', editedByMarshal: true, version: 1 },
      { playerId: 'x', hole: 18, strokes: 4, isOut: false, status: 'ENTERED', editedByMarshal: false, version: 1 },
    ] as any);
    assert.equal(lp.scores.IN[0], 5); assert.equal(lp.approvals.IN[0], true); assert.equal(lp.versions.IN[0], 2);
    assert.equal(lp.scores.OUT[0], 'OUT'); assert.equal(lp.marshalEdited.OUT[0], true);
    assert.equal(lp.scores.OUT[8], 4); assert.equal(lp.approvals.OUT[8], false);

  });
});
