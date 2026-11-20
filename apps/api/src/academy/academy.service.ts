import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AcademyProgressStatus,
  AcademyRole,
  AcademySessionStatus,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ACADEMY_AUDIENCE, AcademyPrincipal } from './academy-auth.guard';
import {
  AcademyLoginDto,
  CompleteEvaluationDto,
  CreateAccountDto,
  CreateSessionDto,
  UpdateProgressDto,
} from './dto/academy.dto';

const DEFAULT_SESSION_MINUTES = 90;

const publicAccountSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  avatarUrl: true,
  phone: true,
  specialty: true,
  rating: true,
  coachId: true,
  programId: true,
  packageName: true,
  remainingSessions: true,
  createdAt: true,
} satisfies Prisma.AcademyAccountSelect;

const num = (d: Prisma.Decimal | null | undefined) =>
  d == null ? null : Number(d);

@Injectable()
export class AcademyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ── Auth ────────────────────────────────────────────────────

  async login(dto: AcademyLoginDto) {
    const account = await this.prisma.academyAccount.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { coach: { select: { id: true, name: true } }, program: true },
    });
    const ok =
      account &&
      account.status === 'ACTIVE' &&
      account.role === (dto.role.toUpperCase() as AcademyRole) &&
      (await bcrypt.compare(dto.password, account.passwordHash));
    if (!ok) {
      throw new UnauthorizedException('Email atau password salah');
    }

    await this.prisma.academyAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.jwt.signAsync(
      { sub: account.id, role: account.role },
      { audience: ACADEMY_AUDIENCE, expiresIn: '12h' },
    );
    return { token, account: this.toAccountView(account) };
  }

  async me(user: AcademyPrincipal) {
    const account = await this.prisma.academyAccount.findUniqueOrThrow({
      where: { id: user.id },
      include: { coach: { select: { id: true, name: true } }, program: true },
    });
    return this.toAccountView(account);
  }

  async changePassword(user: AcademyPrincipal, current: string, next: string) {
    const account = await this.prisma.academyAccount.findUniqueOrThrow({
      where: { id: user.id },
    });
    if (!(await bcrypt.compare(current, account.passwordHash))) {
      throw new BadRequestException('Password lama salah');
    }
    await this.prisma.academyAccount.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(next, 10) },
    });
    return { ok: true };
  }

  private toAccountView(
    a: Prisma.AcademyAccountGetPayload<{
      include: { coach: { select: { id: true; name: true } }; program: true };
    }>,
  ) {
    return {
      id: a.id,
      email: a.email,
      name: a.name,
      role: a.role.toLowerCase() as 'student' | 'coach' | 'admin',
      avatarUrl: a.avatarUrl,
      phone: a.phone,
      specialty: a.specialty,
      rating: num(a.rating),
      coach: a.coach,
      program: a.program
        ? { id: a.program.id, level: a.program.level, title: a.program.title }
        : null,
      packageName: a.packageName,
      remainingSessions: a.remainingSessions,
      joinedAt: a.createdAt,
    };
  }

  // ── Accounts (admin) ────────────────────────────────────────

  async createAccount(dto: CreateAccountDto) {
    const exists = await this.prisma.academyAccount.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) throw new BadRequestException('Email sudah terdaftar');
    return this.prisma.academyAccount.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        role: dto.role,
        passwordHash: await bcrypt.hash(dto.password, 10),
        specialty: dto.specialty,
        coachId: dto.coachId,
        programId: dto.programId,
        packageName: dto.packageName,
        remainingSessions: dto.remainingSessions,
      },
      select: publicAccountSelect,
    });
  }

  async assignCoach(studentId: string, coachId: string | null) {
    if (coachId) {
      const coach = await this.prisma.academyAccount.findUnique({
        where: { id: coachId },
      });
      if (coach?.role !== 'COACH') throw new BadRequestException('Coach tidak valid');
    }
    return this.prisma.academyAccount.update({
      where: { id: studentId, role: 'STUDENT' },
      data: { coachId },
      select: publicAccountSelect,
    });
  }

  async setAccountStatus(id: string, active: boolean) {
    return this.prisma.academyAccount.update({
      where: { id },
      data: { status: active ? 'ACTIVE' : 'INACTIVE' },
      select: publicAccountSelect,
    });
  }

  // ── Coaches & students ──────────────────────────────────────

  async listCoaches() {
    const coaches = await this.prisma.academyAccount.findMany({
      where: { role: 'COACH' },
      orderBy: { name: 'asc' },
      select: {
        ...publicAccountSelect,
        students: { select: { id: true, name: true } },
      },
    });
    const completion = await this.coachCompletionRates();
    return coaches.map((c) => ({
      ...c,
      rating: num(c.rating),
      studentCount: c.students.length,
      sessionCompletion: completion.get(c.id) ?? null,
    }));
  }

  /** Completed / (completed + cancelled) sessions per coach, 0-100. */
  private async coachCompletionRates() {
    const rows = await this.prisma.academySession.groupBy({
      by: ['coachId', 'status'],
      where: { status: { in: ['COMPLETED', 'CANCELLED'] } },
      _count: { _all: true },
    });
    const totals = new Map<string, { done: number; all: number }>();
    for (const r of rows) {
      const t = totals.get(r.coachId) ?? { done: 0, all: 0 };
      t.all += r._count._all;
      if (r.status === 'COMPLETED') t.done += r._count._all;
      totals.set(r.coachId, t);
    }
    const out = new Map<string, number>();
    totals.forEach((t, id) =>
      out.set(id, t.all ? Math.round((t.done / t.all) * 100) : 0),
    );
    return out;
  }

  async listStudents(user: AcademyPrincipal, search?: string) {
    const where: Prisma.AcademyAccountWhereInput = { role: 'STUDENT' };
    if (user.role === 'COACH') where.coachId = user.id;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const now = new Date();
    const [students, totalLessons] = await Promise.all([
      this.prisma.academyAccount.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
          ...publicAccountSelect,
          coach: { select: { id: true, name: true } },
          program: { select: { id: true, level: true, title: true } },
          sessionsAsStudent: {
            select: { startsAt: true, endsAt: true, status: true },
            orderBy: { startsAt: 'asc' },
          },
          _count: { select: { progress: { where: { status: 'COMPLETED' } } } },
        },
      }),
      this.prisma.academySyllabusLesson.count(),
    ]);

    return students.map(({ sessionsAsStudent: sessions, _count, rating: _r, ...s }) => {
      const completed = sessions.filter((x) => x.status === 'COMPLETED');
      const closed = sessions.filter((x) => x.status === 'COMPLETED' || x.status === 'CANCELLED');
      const next = sessions.find(
        (x) => (x.status === 'UPCOMING' || x.status === 'ONGOING') && x.endsAt >= now,
      );
      return {
        ...s,
        lastPracticeAt: completed.at(-1)?.startsAt ?? null,
        nextSessionAt: next?.startsAt ?? null,
        completedSessions: completed.length,
        attendance: closed.length ? Math.round((completed.length / closed.length) * 100) : null,
        syllabusProgress: totalLessons ? Math.round((_count.progress / totalLessons) * 100) : 0,
      };
    });
  }

  /** Throws unless `user` may view data for `studentId`. */
  async assertCanViewStudent(user: AcademyPrincipal, studentId: string) {
    if (user.role === 'ADMIN') return;
    if (user.role === 'STUDENT' && user.id === studentId) return;
    if (user.role === 'COACH') {
      const s = await this.prisma.academyAccount.findUnique({
        where: { id: studentId },
        select: { coachId: true },
      });
      if (s?.coachId === user.id) return;
    }
    throw new ForbiddenException();
  }

  // ── Catalog ─────────────────────────────────────────────────

  listVenues() {
    return this.prisma.academyVenue
      .findMany({ orderBy: { name: 'asc' } })
      .then((v) => v.map((x) => ({ ...x, rating: num(x.rating) })));
  }

  async listPrograms() {
    const programs = await this.prisma.academyProgram.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        modules: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { students: true } },
      },
    });
    return programs.map(({ _count, ...p }) => ({
      ...p,
      rating: num(p.rating),
      studentCount: _count.students,
    }));
  }

  listLearningContent() {
    return this.prisma.academyLearningContent.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  // ── Syllabus & progress ─────────────────────────────────────

  /**
   * Programs → sublevels → lessons with this student's status.
   * Lessons without a progress row are LOCKED, except the first lesson of a
   * student's first sublevel (PENDING) so a new student has somewhere to start.
   */
  async syllabusFor(studentId: string) {
    const [programs, progress] = await Promise.all([
      this.prisma.academyProgram.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          sublevels: {
            orderBy: { sortOrder: 'asc' },
            include: { lessons: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      }),
      this.prisma.academyProgress.findMany({ where: { studentId } }),
    ]);
    const byLesson = new Map(progress.map((p) => [p.lessonId, p.status]));
    let seededStart = progress.length > 0;

    return programs.map((p) => ({
      id: p.id,
      code: p.code,
      level: p.level,
      title: p.title,
      description: p.description,
      color: p.color,
      isAvailable: p.isAvailable,
      sublevels: p.sublevels.map((s) => {
        const lessons = s.lessons.map((l) => {
          let status = byLesson.get(l.id);
          if (!status) {
            status = seededStart ? 'LOCKED' : 'PENDING';
            seededStart = true;
          }
          return {
            id: l.id,
            name: l.name,
            status: status.toLowerCase().replace('_', '-'),
          };
        });
        const allLocked = lessons.every((l) => l.status === 'locked');
        const allDone =
          lessons.length > 0 && lessons.every((l) => l.status === 'completed');
        return {
          id: s.id,
          name: s.name,
          evaluation: s.evaluationName,
          evalStatus: allLocked ? 'locked' : allDone ? 'ready' : 'pending',
          lessons,
        };
      }),
    }));
  }

  async updateProgress(user: AcademyPrincipal, dto: UpdateProgressDto) {
    await this.assertCanViewStudent(user, dto.studentId);
    if (user.role === 'STUDENT') throw new ForbiddenException();
    return this.prisma.academyProgress.upsert({
      where: {
        studentId_lessonId: { studentId: dto.studentId, lessonId: dto.lessonId },
      },
      create: { studentId: dto.studentId, lessonId: dto.lessonId, status: dto.status },
      update: { status: dto.status },
    });
  }

  // ── Sessions (schedule / booking / tracker) ─────────────────

  async listSessions(
    user: AcademyPrincipal,
    opts: { from?: string; to?: string; studentId?: string },
  ) {
    const where: Prisma.AcademySessionWhereInput = {};
    if (user.role === 'STUDENT') where.studentId = user.id;
    if (user.role === 'COACH') where.coachId = user.id;
    if (opts.studentId) {
      await this.assertCanViewStudent(user, opts.studentId);
      where.studentId = opts.studentId;
    }
    if (opts.from || opts.to) {
      where.startsAt = {
        ...(opts.from ? { gte: new Date(opts.from) } : {}),
        ...(opts.to ? { lt: new Date(opts.to) } : {}),
      };
    }
    return this.prisma.academySession.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            program: { select: { level: true } },
          },
        },
        coach: { select: { id: true, name: true, avatarUrl: true } },
        venue: { select: { id: true, name: true, location: true } },
        program: { select: { id: true, level: true, title: true } },
      },
    });
  }

  async createSession(user: AcademyPrincipal, dto: CreateSessionDto) {
    const studentId =
      user.role === 'STUDENT' ? user.id : (dto.studentId ?? null);
    if (!studentId) throw new BadRequestException('studentId wajib diisi');
    if (user.role === 'COACH') await this.assertCanViewStudent(user, studentId);
    // Coaches can only schedule themselves.
    const coachId = user.role === 'COACH' ? user.id : dto.coachId;

    const coach = await this.prisma.academyAccount.findUnique({
      where: { id: coachId },
    });
    if (coach?.role !== 'COACH' || coach.status !== 'ACTIVE') {
      throw new BadRequestException('Coach tidak valid');
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt
      ? new Date(dto.endsAt)
      : new Date(startsAt.getTime() + DEFAULT_SESSION_MINUTES * 60_000);
    if (!(endsAt > startsAt)) throw new BadRequestException('Waktu sesi tidak valid');
    if (startsAt < new Date()) throw new BadRequestException('Tidak bisa booking waktu yang sudah lewat');

    return this.prisma.$transaction(async (tx) => {
      const clash = await tx.academySession.findFirst({
        where: {
          coachId: coachId,
          status: { in: ['UPCOMING', 'ONGOING'] },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      });
      if (clash) throw new BadRequestException('Coach sudah ada jadwal di jam tersebut');

      const student = await tx.academyAccount.findUniqueOrThrow({
        where: { id: studentId },
      });
      if (student.remainingSessions != null) {
        if (student.remainingSessions <= 0) {
          throw new BadRequestException('Sisa sesi paket sudah habis');
        }
        await tx.academyAccount.update({
          where: { id: studentId },
          data: { remainingSessions: { decrement: 1 } },
        });
      }

      return tx.academySession.create({
        data: {
          studentId,
          coachId: coachId,
          venueId: dto.venueId,
          programId: dto.programId ?? student.programId,
          startsAt,
          endsAt,
          type: dto.type ?? 'Private',
          topic: dto.topic,
        },
      });
    });
  }

  async updateSessionStatus(
    user: AcademyPrincipal,
    id: string,
    status: AcademySessionStatus,
  ) {
    const session = await this.prisma.academySession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException();
    if (user.role === 'COACH' && session.coachId !== user.id) throw new ForbiddenException();
    if (user.role === 'STUDENT') {
      // Students may only cancel their own upcoming sessions.
      if (session.studentId !== user.id || status !== 'CANCELLED' || session.status !== 'UPCOMING') {
        throw new ForbiddenException();
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.academySession.update({ where: { id }, data: { status } });
      // Refund a package session when an upcoming booking is cancelled.
      if (status === 'CANCELLED' && session.status === 'UPCOMING') {
        await tx.academyAccount.updateMany({
          where: { id: session.studentId, remainingSessions: { not: null } },
          data: { remainingSessions: { increment: 1 } },
        });
      }
      // Completing a session queues an evaluation for the coach.
      if (status === 'COMPLETED' && session.status !== 'COMPLETED') {
        await tx.academyEvaluation.create({
          data: {
            studentId: session.studentId,
            coachId: session.coachId,
            sessionId: session.id,
            topic: session.topic ?? session.type,
          },
        });
      }
      return updated;
    });
  }

  // ── Evaluations ─────────────────────────────────────────────

  async listEvaluations(
    user: AcademyPrincipal,
    opts: { status?: string; studentId?: string; limit?: number },
  ) {
    const where: Prisma.AcademyEvaluationWhereInput = {};
    if (user.role === 'STUDENT') where.studentId = user.id;
    if (user.role === 'COACH') where.coachId = user.id;
    if (opts.studentId) {
      await this.assertCanViewStudent(user, opts.studentId);
      where.studentId = opts.studentId;
    }
    if (opts.status === 'pending' || opts.status === 'completed') {
      where.status = opts.status === 'pending' ? 'PENDING' : 'COMPLETED';
    }
    const rows = await this.prisma.academyEvaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(opts.limit ?? 100, 500),
      include: {
        student: { select: { id: true, name: true, program: { select: { level: true, title: true } } } },
        coach: { select: { id: true, name: true } },
        session: { select: { startsAt: true } },
      },
    });
    return rows.map((r) => ({ ...r, score: num(r.score) }));
  }

  async completeEvaluation(user: AcademyPrincipal, id: string, dto: CompleteEvaluationDto) {
    const ev = await this.prisma.academyEvaluation.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException();
    if (user.role === 'COACH' && ev.coachId !== user.id) throw new ForbiddenException();
    const row = await this.prisma.academyEvaluation.update({
      where: { id },
      data: {
        score: dto.score,
        notes: dto.notes,
        status: 'COMPLETED',
        evaluatedAt: new Date(),
      },
    });
    return { ...row, score: num(row.score) };
  }

  // ── Messages ────────────────────────────────────────────────

  /** Who this user may message: student ↔ own coach, coach ↔ own students, admin ↔ everyone. */
  async listContacts(user: AcademyPrincipal) {
    let where: Prisma.AcademyAccountWhereInput;
    if (user.role === 'ADMIN') {
      where = { id: { not: user.id } };
    } else if (user.role === 'COACH') {
      where = { OR: [{ coachId: user.id }, { role: 'ADMIN' }] };
    } else {
      const me = await this.prisma.academyAccount.findUniqueOrThrow({
        where: { id: user.id },
        select: { coachId: true },
      });
      where = { OR: [{ id: me.coachId ?? '__none__' }, { role: 'ADMIN' }] };
    }
    where = { AND: [where, { status: 'ACTIVE' }] };

    const contacts = await this.prisma.academyAccount.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true, avatarUrl: true, specialty: true },
    });
    const [lastMessages, unread] = await Promise.all([
      this.prisma.academyMessage.findMany({
        where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
        orderBy: { createdAt: 'desc' },
        distinct: ['senderId', 'recipientId'],
        take: 500,
      }),
      this.prisma.academyMessage.groupBy({
        by: ['senderId'],
        where: { recipientId: user.id, readAt: null },
        _count: { _all: true },
      }),
    ]);
    const unreadBy = new Map(unread.map((u) => [u.senderId, u._count._all]));
    return contacts.map((c) => {
      const last = lastMessages.find(
        (m) => m.senderId === c.id || m.recipientId === c.id,
      );
      return {
        ...c,
        role: c.role.toLowerCase(),
        lastMessage: last ? { text: last.text, createdAt: last.createdAt } : null,
        unread: unreadBy.get(c.id) ?? 0,
      };
    });
  }

  private async assertCanMessage(user: AcademyPrincipal, otherId: string) {
    const contacts = await this.listContacts(user);
    if (!contacts.some((c) => c.id === otherId)) throw new ForbiddenException();
  }

  async conversation(user: AcademyPrincipal, otherId: string) {
    await this.assertCanMessage(user, otherId);
    await this.prisma.academyMessage.updateMany({
      where: { senderId: otherId, recipientId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return this.prisma.academyMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, recipientId: otherId },
          { senderId: otherId, recipientId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
  }

  async sendMessage(user: AcademyPrincipal, otherId: string, text: string) {
    await this.assertCanMessage(user, otherId);
    return this.prisma.academyMessage.create({
      data: { senderId: user.id, recipientId: otherId, text: text.trim() },
    });
  }

  // ── Feedback ────────────────────────────────────────────────

  createFeedback(user: AcademyPrincipal, dto: { rating: number; category: string; message: string }) {
    return this.prisma.academyFeedback.create({
      data: { accountId: user.id, rating: dto.rating, category: dto.category, message: dto.message.trim() },
    });
  }

  listFeedback() {
    return this.prisma.academyFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { account: { select: { id: true, name: true, role: true } } },
    });
  }

  // ── Dashboards & reports ────────────────────────────────────

  async stats(user: AcademyPrincipal) {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86_400_000);

    if (user.role === 'ADMIN') {
      const [students, coaches, programs, sessionsThisMonth] = await Promise.all([
        this.prisma.academyAccount.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
        this.prisma.academyAccount.count({ where: { role: 'COACH', status: 'ACTIVE' } }),
        this.prisma.academyProgram.count({ where: { isAvailable: true } }),
        this.prisma.academySession.count({
          where: {
            status: 'COMPLETED',
            startsAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
          },
        }),
      ]);
      return { students, coaches, programs, sessionsThisMonth };
    }

    if (user.role === 'COACH') {
      const [students, pendingEvaluations, completedSessions, todaySessions] =
        await Promise.all([
          this.prisma.academyAccount.count({ where: { coachId: user.id } }),
          this.prisma.academyEvaluation.count({ where: { coachId: user.id, status: 'PENDING' } }),
          this.prisma.academySession.count({ where: { coachId: user.id, status: 'COMPLETED' } }),
          this.prisma.academySession.count({
            where: {
              coachId: user.id,
              startsAt: { gte: dayStart, lt: dayEnd },
              status: { not: 'CANCELLED' },
            },
          }),
        ]);
      return { students, pendingEvaluations, completedSessions, todaySessions };
    }

    const [completed, past, progress, lastEval] = await Promise.all([
      this.prisma.academySession.count({ where: { studentId: user.id, status: 'COMPLETED' } }),
      this.prisma.academySession.count({
        where: { studentId: user.id, startsAt: { lt: now }, status: { in: ['COMPLETED', 'CANCELLED'] } },
      }),
      this.prisma.academyProgress.groupBy({
        by: ['status'],
        where: { studentId: user.id },
        _count: { _all: true },
      }),
      this.prisma.academyEvaluation.findFirst({
        where: { studentId: user.id, status: 'COMPLETED' },
        orderBy: { evaluatedAt: 'desc' },
        select: { score: true },
      }),
    ]);
    const totalLessons = await this.prisma.academySyllabusLesson.count();
    const done = progress.find((p) => p.status === AcademyProgressStatus.COMPLETED)?._count._all ?? 0;
    const current = await this.prisma.academyProgress.findFirst({
      where: { studentId: user.id, status: { in: ['IN_PROGRESS', 'PENDING'] } },
      include: { lesson: { include: { sublevel: true } } },
      orderBy: { lesson: { sortOrder: 'asc' } },
    });
    return {
      completedSessions: completed,
      attendance: past ? Math.round((completed / past) * 100) : null,
      syllabusProgress: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
      currentSublevel: current?.lesson.sublevel.name ?? null,
      lastScore: num(lastEval?.score),
    };
  }

  async reports() {
    const [coaches, recentEvaluations, students, graduatesThisMonth, evalAgg] =
      await Promise.all([
        this.listCoaches(),
        this.listEvaluations(
          { id: '', role: 'ADMIN', name: '', email: '' },
          { status: 'completed', limit: 10 },
        ),
        this.prisma.academyAccount.count({ where: { role: 'STUDENT' } }),
        this.prisma.academyEvaluation.count({
          where: {
            status: 'COMPLETED',
            score: { gte: 70 },
            evaluatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        }),
        this.prisma.academyEvaluation.aggregate({
          where: { status: 'COMPLETED' },
          _avg: { score: true },
          _count: { _all: true },
        }),
      ]);
    const passed = await this.prisma.academyEvaluation.count({
      where: { status: 'COMPLETED', score: { gte: 70 } },
    });
    const rated = coaches.filter((c) => c.sessionCompletion != null);
    return {
      totalStudents: students,
      graduatesThisMonth,
      passRate: evalAgg._count._all ? Math.round((passed / evalAgg._count._all) * 100) : null,
      averageScore: num(evalAgg._avg.score),
      coachEffectiveness: rated.length
        ? Math.round(rated.reduce((s, c) => s + (c.sessionCompletion ?? 0), 0) / rated.length)
        : null,
      coachPerformance: coaches
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .map((c) => ({
          id: c.id,
          name: c.name,
          students: c.studentCount,
          rating: c.rating,
          completion: c.sessionCompletion,
        })),
      recentEvaluations,
    };
  }
}
