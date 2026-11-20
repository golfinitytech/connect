/**
 * One-off data copy between two Postgres databases with the same Prisma schema
 * (used to move from the Sydney Supabase project to Singapore).
 *
 *   SOURCE_URL=postgresql://... TARGET_URL=postgresql://... node ops/supabase/copy-data.js
 *
 * Run `prisma migrate deploy` against TARGET first. Refuses to run if any target table
 * already has rows. Copies inside one transaction, so a failure leaves TARGET empty.
 */
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../../apps/api/node_modules/@prisma/client'));

// Parents before children (foreign keys).
const ORDER = [
  'User', 'PasswordReset', 'UserPreference', 'Notification',
  'Course', 'Hole', 'TeeBox', 'Round', 'RoundPlayer', 'HoleScore', 'Event', 'EventRegistration',
  'MenuCategory', 'MenuItem', 'Order', 'OrderItem', 'OrderStatusLog',
  'Tournament', 'TournamentGroup', 'TournamentPlayer', 'TournamentScore', 'TournamentScoreLog', 'TournamentMessage',
  'AdminNotification', 'CaddiePerformance',
  'AcademyProgram', 'AcademyAccount', 'AcademyVenue', 'AcademyModule', 'AcademySublevel', 'AcademySyllabusLesson',
  'AcademyProgress', 'AcademySession', 'AcademyEvaluation', 'AcademyLearningContent', 'AcademyMessage', 'AcademyFeedback',
];

(async () => {
  const { SOURCE_URL, TARGET_URL } = process.env;
  if (!SOURCE_URL || !TARGET_URL) throw new Error('SOURCE_URL and TARGET_URL are required');
  const src = new PrismaClient({ datasources: { db: { url: SOURCE_URL } } });
  const dst = new PrismaClient({ datasources: { db: { url: TARGET_URL } }, transactionOptions: { timeout: 120000, maxWait: 20000 } });

  const listTables = async (db) =>
    (await db.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name <> '_prisma_migrations'`,
    )).map((r) => r.table_name);

  const srcTables = await listTables(src);
  const unknown = srcTables.filter((t) => !ORDER.includes(t));
  if (unknown.length) throw new Error(`Tables not in copy order: ${unknown.join(', ')}`);
  const dstTables = await listTables(dst);
  const missing = srcTables.filter((t) => !dstTables.includes(t));
  if (missing.length) throw new Error(`Target is missing tables (run migrate deploy): ${missing.join(', ')}`);

  for (const t of srcTables) {
    const [{ n }] = await dst.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "${t}"`);
    if (n > 0) throw new Error(`Target table "${t}" is not empty; refusing to copy.`);
  }

  const tables = ORDER.filter((t) => srcTables.includes(t));
  const counts = {};
  const data = {};
  for (const t of tables) {
    const [{ rows }] = await src.$queryRawUnsafe(`SELECT coalesce(json_agg(x), '[]'::json) AS rows FROM "${t}" x`);
    data[t] = rows;
  }

  await dst.$transaction(async (tx) => {
    for (const t of tables) {
      if (!data[t].length) continue;
      await tx.$executeRawUnsafe(
        `INSERT INTO "${t}" SELECT * FROM json_populate_recordset(NULL::"${t}", $1::json)`,
        JSON.stringify(data[t]),
      );
      counts[t] = data[t].length;
    }
  });

  // Verify row counts match.
  const bad = [];
  for (const t of tables) {
    const [{ a }] = await src.$queryRawUnsafe(`SELECT count(*)::int AS a FROM "${t}"`);
    const [{ b }] = await dst.$queryRawUnsafe(`SELECT count(*)::int AS b FROM "${t}"`);
    if (a !== b) bad.push(`${t}: ${a} vs ${b}`);
  }
  console.log('Copied rows:', counts);
  console.log(bad.length ? `COUNT MISMATCH: ${bad.join('; ')}` : 'All table row counts match.');
  await src.$disconnect();
  await dst.$disconnect();
  if (bad.length) process.exit(1);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
