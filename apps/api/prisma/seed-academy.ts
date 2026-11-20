/**
 * Seeds Portal Akademik data (accounts, curriculum, syllabus, venues, sessions,
 * evaluations, learning content). Idempotent: re-running upserts by natural keys
 * and never overwrites an existing account's password.
 *
 *   ACADEMY_SEED_PASSWORD=... npm -w apps/api run seed:academy
 *
 * Without ACADEMY_SEED_PASSWORD each new account gets a random password,
 * printed once at the end.
 */
import { AcademyContentType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const created: { email: string; role: string; password: string }[] = [];

const coaches = [
  { email: 'ana.suhana@golfinity.id', name: 'Ana Suhana', specialty: 'Senior Coach • Fundamentals', rating: 4.9, photo: 'ana-suhana' },
  { email: 'anang.mulyanto@golfinity.id', name: 'Anang Mulyanto', specialty: 'Head Coach • Advanced Swing', rating: 5.0, photo: 'anang-mulyanto' },
  { email: 'apep.benhur@golfinity.id', name: 'Apep Benhur', specialty: 'Pro Coach • Junior Specialist', rating: 4.8, photo: 'apep-benhur' },
  { email: 'atep.suwarman@golfinity.id', name: 'Atep Suwarman', specialty: 'Short Game Expert', rating: 4.7, photo: 'atep-suwarman' },
  { email: 'itang.saepudin@golfinity.id', name: 'Itang Saepudin', specialty: 'Mental & Strategy', rating: 4.9, photo: 'itang-saepudin' },
  { email: 'jefrizal.sani@golfinity.id', name: 'Jefrizal Sani', specialty: 'Technical Analyst', rating: 4.6, photo: 'jefrizal-sani' },
  { email: 'sakim.budi@golfinity.id', name: 'Sakim Mahara Budi', specialty: 'Physical Conditioning', rating: 4.9, photo: 'sakim-mahara-budi' },
  { email: 'uji.setiaji@golfinity.id', name: 'Uji Setiaji', specialty: 'Tour Professional Coach', rating: 5.0, photo: 'uji-setiaji' },
];

const students = [
  { email: 'regi@gmail.com', name: 'Regi', coach: 'anang.mulyanto@golfinity.id', packageName: '12 Sesi', remaining: 5 },
  { email: 'hadi@gmail.com', name: 'Hadi', coach: 'anang.mulyanto@golfinity.id', packageName: '24 Sesi', remaining: 18 },
  { email: 'fakih@gmail.com', name: 'Fakih', coach: 'anang.mulyanto@golfinity.id', packageName: 'Unlimited', remaining: null },
  { email: 'ridho@gmail.com', name: 'Ridho', coach: 'anang.mulyanto@golfinity.id', packageName: '12 Sesi', remaining: 5 },
  { email: 'student@golfinity.id', name: 'John Doe', coach: 'apep.benhur@golfinity.id', packageName: '24 Sesi', remaining: 18 },
];

const venues = [
  { name: 'Padang Golf Sulaiman', location: 'Bandung, Jawa Barat', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800' },
  { name: 'Palm Springs Kerawang', location: 'Karawang, Jawa Barat', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800' },
  { name: 'Jatinangor National Golf', location: 'Sumedang, Jawa Barat', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=80&w=800' },
  { name: 'Nawasena Driving Range', location: 'Bandung, Jawa Barat', rating: null, imageUrl: null },
  { name: 'AFS Sulaiman Driving Range', location: 'Bandung, Jawa Barat', rating: null, imageUrl: null },
  { name: 'Golfinity Hub - Indoor', location: 'Bandung, Jawa Barat', rating: null, imageUrl: null },
];

const programs = [
  {
    code: 'level1', level: 'Level 1', title: 'Fundamentals of Golf', color: 'emerald', difficulty: 'Beginner', rating: 4.9,
    description: 'Pengenalan dasar teknik golf, grip, posture, dan pengenalan peralatan.',
    modules: [
      { name: 'Grip & Setup', duration: '2 Weeks', status: 'Active', drills: ['Static Grip Practice', 'Posture Alignment'] },
      { name: 'Basic Swing Motion', duration: '3 Weeks', status: 'Active', drills: ['Half Swing Drill', 'Tempo Control'] },
      { name: 'Introduction to Putter', duration: '1 Week', status: 'Active', drills: ['Pendulum Motion', 'Short Putts'] },
    ],
    sublevels: [
      { name: 'Level 1a', evaluation: 'Mid Level Evaluation', lessons: ['Session 1 - Grip', 'Session 2 - Posture', 'Session 3 - Alignment', 'Session 4 - Ball Position'] },
      { name: 'Level 1b', evaluation: 'Level 1 Evaluation', lessons: ['Session 5 - Grip Review', 'Session 6 - Half Swing', 'Session 7 - Weight Transfer', 'Session 8 - Finish Position'] },
    ],
  },
  {
    code: 'level2', level: 'Level 2', title: 'Advanced Swing Mechanics', color: 'blue', difficulty: 'Intermediate', rating: 4.8,
    description: 'Pendalaman teknik swing, kontrol jarak, dan pengenalan iron shot.',
    modules: [
      { name: 'Full Swing Consistency', duration: '4 Weeks', status: 'Active', drills: ['Impact Position', 'Weight Transfer'] },
      { name: 'Iron Play Fundamentals', duration: '3 Weeks', status: 'Active', drills: ['Divot Control', 'Ball Striking'] },
      { name: 'Distance Control', duration: '2 Weeks', status: 'Draft', drills: ['Club Selection', 'Trajectory Control'] },
    ],
    sublevels: [],
  },
  {
    code: 'level3', level: 'Level 3', title: 'Short Game & Course Management', color: 'amber', difficulty: 'Advanced', rating: 5.0,
    description: 'Fokus pada chipping, pitching, bunker shots, dan strategi di lapangan.',
    modules: [
      { name: 'Chipping & Pitching', duration: '3 Weeks', status: 'Active', drills: ['Landing Spot Drill', 'Spin Control'] },
      { name: 'Bunker Play', duration: '2 Weeks', status: 'Active', drills: ['Splash Shot', 'Buried Lie'] },
      { name: 'Course Strategy', duration: '3 Weeks', status: 'Active', drills: ['Risk Reward Analysis', 'Wind Reading'] },
    ],
    sublevels: [],
  },
];

const learning: { title: string; type: AcademyContentType; description: string; duration: string; tag: string }[] = [
  { title: 'Panduan Dasar Golfinity', type: 'BOOKLET', description: 'Materi dasar teknik golf, terminologi, dan pengenalan alat.', duration: '24 Pages', tag: 'Foundation' },
  { title: 'Etika & Aturan Lapangan', type: 'BOOKLET', description: 'Panduan perilaku dan peraturan resmi di lapangan golf.', duration: '15 Pages', tag: 'Essentials' },
  { title: 'Teknik Swing Dasar', type: 'VIDEO', description: 'Langkah-langkah membangun swing yang konsisten dan powerful.', duration: '12:45', tag: 'Video' },
  { title: 'Mastering Your Putts', type: 'VIDEO', description: 'Cara membaca green dan teknik putting yang akurat.', duration: '08:20', tag: 'Short Game' },
  { title: 'Bunker Escape Masterclass', type: 'VIDEO', description: 'Tips keluar dari bunker dengan satu pukulan.', duration: '10:15', tag: 'Pro Tips' },
  { title: 'Pentingnya Pemanasan', type: 'ARTICLE', description: 'Latihan peregangan khusus golf untuk menghindari cedera.', duration: '5 min read', tag: 'Health' },
  { title: 'Memilih Stick yang Tepat', type: 'ARTICLE', description: 'Panduan fitting stick golf sesuai dengan postur dan power.', duration: '8 min read', tag: 'Equipment' },
  { title: 'Grip Rahasia untuk Akurasi', type: 'COACH_TIP', description: 'Coach Anang Mulyanto membagikan teknik grip untuk kontrol maksimal.', duration: 'Pro Tip', tag: 'Expert' },
  { title: 'Mental Game: Tetap Fokus', type: 'COACH_TIP', description: 'Tips dari Coach Itang Saepudin untuk menjaga ketenangan saat turnamen.', duration: 'Pro Tip', tag: 'Mindset' },
  { title: 'Short Game Mastery', type: 'COACH_TIP', description: 'Strategi chipping di sekitar green oleh Coach Atep Suwarman.', duration: 'Pro Tip', tag: 'Strategy' },
];

async function upsertAccount(data: {
  email: string;
  name: string;
  role: 'STUDENT' | 'COACH' | 'ADMIN';
  [k: string]: unknown;
}) {
  const existing = await prisma.academyAccount.findUnique({ where: { email: data.email } });
  if (existing) {
    const { email: _e, ...rest } = data;
    return prisma.academyAccount.update({ where: { id: existing.id }, data: rest as any });
  }
  const password = process.env.ACADEMY_SEED_PASSWORD || crypto.randomBytes(9).toString('base64url');
  created.push({ email: data.email, role: data.role, password });
  return prisma.academyAccount.create({
    data: { ...(data as any), passwordHash: await bcrypt.hash(password, 10) },
  });
}

/** Today at hh:mm local time, shifted by `dayOffset` days. */
function at(dayOffset: number, hh: number, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d;
}

async function main() {
  // Programs, modules, sublevels, lessons
  const programIds: Record<string, string> = {};
  const lessonIds: string[] = [];
  for (const [i, p] of programs.entries()) {
    const program = await prisma.academyProgram.upsert({
      where: { code: p.code },
      create: { code: p.code, level: p.level, title: p.title, description: p.description, difficulty: p.difficulty, rating: p.rating, color: p.color, sortOrder: i, isAvailable: p.sublevels.length > 0 },
      update: { level: p.level, title: p.title, description: p.description, difficulty: p.difficulty, rating: p.rating, color: p.color, sortOrder: i },
    });
    programIds[p.code] = program.id;

    if ((await prisma.academyModule.count({ where: { programId: program.id } })) === 0) {
      await prisma.academyModule.createMany({
        data: p.modules.map((m, j) => ({ ...m, programId: program.id, sortOrder: j })),
      });
    }
    if ((await prisma.academySublevel.count({ where: { programId: program.id } })) === 0) {
      for (const [j, s] of p.sublevels.entries()) {
        await prisma.academySublevel.create({
          data: {
            programId: program.id,
            name: s.name,
            evaluationName: s.evaluation,
            sortOrder: j,
            lessons: { create: s.lessons.map((name, k) => ({ name, sortOrder: k })) },
          },
        });
      }
    }
  }
  const level1Lessons = await prisma.academySyllabusLesson.findMany({
    where: { sublevel: { programId: programIds.level1 } },
    orderBy: [{ sublevel: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });
  lessonIds.push(...level1Lessons.map((l) => l.id));

  // Venues
  const venueIds: Record<string, string> = {};
  for (const v of venues) {
    const row = await prisma.academyVenue.upsert({ where: { name: v.name }, create: v, update: v });
    venueIds[v.name] = row.id;
  }

  // Accounts
  await upsertAccount({ email: 'admingolfinity@golfinity.id', name: 'Admin Director', role: 'ADMIN' });
  const coachIds: Record<string, string> = {};
  for (const c of coaches) {
    const row = await upsertAccount({
      email: c.email, name: c.name, role: 'COACH', specialty: c.specialty, rating: c.rating,
      avatarUrl: `/academy/coaches/${c.photo}.jpeg`,
    });
    coachIds[c.email] = row.id;
  }
  const studentIds: Record<string, string> = {};
  for (const s of students) {
    const row = await upsertAccount({
      email: s.email, name: s.name, role: 'STUDENT', coachId: coachIds[s.coach],
      programId: programIds.level1, packageName: s.packageName, remainingSessions: s.remaining,
    });
    studentIds[s.name] = row.id;
  }

  // Demo activity — only on a fresh database, so real data is never duplicated.
  if ((await prisma.academySession.count()) === 0) {
    const anang = coachIds['anang.mulyanto@golfinity.id'];
    const apep = coachIds['apep.benhur@golfinity.id'];

    // Progress: first two lessons done, third in progress, fourth pending, rest locked.
    const pattern = ['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'PENDING'] as const;
    for (const id of Object.values(studentIds)) {
      await prisma.academyProgress.createMany({
        data: lessonIds.map((lessonId, i) => ({ studentId: id, lessonId, status: pattern[i] ?? 'LOCKED' })),
      });
    }

    const sessions = [
      { s: 'Regi', c: anang, start: at(0, 8), type: 'On-Field Training', topic: 'Alignment', venue: 'Padang Golf Sulaiman', status: 'UPCOMING' },
      { s: 'Hadi', c: anang, start: at(0, 10), type: 'Swing Analysis', topic: 'Basic Swing Motion', venue: 'Golfinity Hub - Indoor', status: 'UPCOMING' },
      { s: 'Fakih', c: anang, start: at(0, 13), type: 'Putting Drills', topic: 'Putting', venue: 'Palm Springs Kerawang', status: 'UPCOMING' },
      { s: 'Ridho', c: anang, start: at(0, 15, 30), type: 'Strategy & Mental', topic: 'Strategy', venue: 'Jatinangor National Golf', status: 'UPCOMING' },
      { s: 'John Doe', c: apep, start: at(3, 10), type: 'Private', topic: 'Pitching & Bunker', venue: 'AFS Sulaiman Driving Range', status: 'UPCOMING' },
      { s: 'John Doe', c: apep, start: at(-1, 9), type: 'Intro to Golf', topic: 'Half Swing Introduction', venue: 'Nawasena Driving Range', status: 'COMPLETED' },
      { s: 'John Doe', c: anang, start: at(-8, 10), type: 'Private', topic: 'Grip', venue: 'AFS Sulaiman Driving Range', status: 'COMPLETED' },
      { s: 'Regi', c: anang, start: at(-1, 10), type: 'Private', topic: 'Grip & Stance Improvement', venue: 'Padang Golf Sulaiman', status: 'COMPLETED' },
      { s: 'Hadi', c: anang, start: at(-1, 13, 30), type: 'Private', topic: 'Basic Swing Motion', venue: 'Padang Golf Sulaiman', status: 'COMPLETED' },
      { s: 'Fakih', c: anang, start: at(-2, 16), type: 'Private', topic: 'Iron Consistency', venue: 'Palm Springs Kerawang', status: 'COMPLETED' },
      { s: 'Ridho', c: anang, start: at(-2, 9), type: 'Private', topic: 'Putting Alignment', venue: 'Jatinangor National Golf', status: 'COMPLETED' },
    ] as const;
    const scores: Record<string, number | undefined> = { Fakih: 85, Ridho: 90, 'John Doe': 85 };

    for (const x of sessions) {
      const session = await prisma.academySession.create({
        data: {
          studentId: studentIds[x.s], coachId: x.c, venueId: venueIds[x.venue], programId: programIds.level1,
          startsAt: x.start, endsAt: new Date(x.start.getTime() + 90 * 60_000),
          type: x.type, topic: x.topic, status: x.status,
        },
      });
      if (x.status === 'COMPLETED') {
        const score = scores[x.s];
        await prisma.academyEvaluation.create({
          data: {
            studentId: studentIds[x.s], coachId: x.c, sessionId: session.id, topic: x.topic,
            levelLabel: 'Level 1 - Fundamental',
            status: score != null ? 'COMPLETED' : 'PENDING',
            score, evaluatedAt: score != null ? new Date(x.start.getTime() + 2 * 3600_000) : null,
          },
        });
      }
    }
  }

  // Learning content
  if ((await prisma.academyLearningContent.count()) === 0) {
    await prisma.academyLearningContent.createMany({
      data: learning.map((l, i) => ({ ...l, sortOrder: i })),
    });
  }

  console.log('Academy seed complete.');
  if (created.length) {
    console.log('\nNew accounts (store these somewhere safe; they are not shown again):');
    for (const c of created) console.log(`  ${c.role.padEnd(7)} ${c.email.padEnd(32)} ${c.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
