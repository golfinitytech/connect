import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBaseURL } from './api';

// ── Session storage ──────────────────────────────────────────

const TOKEN_KEY = 'academyToken';
const USER_KEY = 'portalUser';

export type AcademyRole = 'student' | 'coach' | 'admin';

export type AcademyUser = {
  id: string;
  email: string;
  name: string;
  role: AcademyRole;
  avatarUrl: string | null;
  phone: string | null;
  specialty: string | null;
  rating: number | null;
  coach: { id: string; name: string } | null;
  program: { id: string; level: string; title: string } | null;
  packageName: string | null;
  remainingSessions: number | null;
  joinedAt: string;
};

export function getPortalUser(): AcademyUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    return raw && token ? (JSON.parse(raw) as AcademyUser) : null;
  } catch {
    return null;
  }
}

export function clearPortalSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

// ── HTTP client ──────────────────────────────────────────────

const http = axios.create({
  baseURL: `${getBaseURL()}/academy`,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const isLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      clearPortalSession();
      if (!window.location.pathname.endsWith('/portalakademik/login')) {
        window.location.assign('/portalakademik/login');
      }
    }
    return Promise.reject(error);
  },
);

const get = <T,>(url: string, params?: object) =>
  http.get<T>(url, { params }).then((r) => r.data);

export function apiErrorMessage(e: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  const msg = (e as any)?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : fallback;
}

// ── Types ────────────────────────────────────────────────────

export type Coach = {
  id: string; name: string; email: string; status: 'ACTIVE' | 'INACTIVE';
  avatarUrl: string | null; specialty: string | null; rating: number | null;
  studentCount: number; sessionCompletion: number | null;
  students: { id: string; name: string }[];
};

export type Student = {
  id: string; name: string; email: string; status: 'ACTIVE' | 'INACTIVE';
  avatarUrl: string | null; phone: string | null;
  coach: { id: string; name: string } | null;
  program: { id: string; level: string; title: string } | null;
  packageName: string | null; remainingSessions: number | null;
  lastPracticeAt: string | null; nextSessionAt: string | null; completedSessions: number;
  attendance: number | null; syllabusProgress: number; createdAt: string;
};

export type Venue = { id: string; name: string; location: string; rating: number | null; imageUrl: string | null };

export type Program = {
  id: string; code: string; level: string; title: string; description: string | null;
  difficulty: string | null; rating: number | null; color: string; isAvailable: boolean;
  studentCount: number;
  modules: { id: string; name: string; duration: string; status: string; drills: string[] }[];
};

export type LessonStatus = 'locked' | 'pending' | 'in-progress' | 'completed';
export type SyllabusProgram = {
  id: string; code: string; level: string; title: string; description: string | null;
  color: string; isAvailable: boolean;
  sublevels: {
    id: string; name: string; evaluation: string; evalStatus: 'locked' | 'pending' | 'ready';
    lessons: { id: string; name: string; status: LessonStatus }[];
  }[];
};

export type SessionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type Session = {
  id: string; startsAt: string; endsAt: string; type: string; topic: string | null;
  status: SessionStatus; location: string | null;
  student: { id: string; name: string; avatarUrl: string | null; program: { level: string } | null };
  coach: { id: string; name: string; avatarUrl: string | null };
  venue: { id: string; name: string; location: string } | null;
  program: { id: string; level: string; title: string } | null;
};

export type Evaluation = {
  id: string; topic: string; levelLabel: string | null; status: 'PENDING' | 'COMPLETED';
  score: number | null; notes: string | null; evaluatedAt: string | null; createdAt: string;
  student: { id: string; name: string; program: { level: string; title: string } | null };
  coach: { id: string; name: string };
  session: { startsAt: string } | null;
};

export type LearningContent = {
  id: string; title: string; type: 'BOOKLET' | 'VIDEO' | 'ARTICLE' | 'COACH_TIP';
  description: string; duration: string; tag: string | null; url: string | null;
};

export type Contact = {
  id: string; name: string; role: AcademyRole; avatarUrl: string | null; specialty: string | null;
  lastMessage: { text: string; createdAt: string } | null; unread: number;
};
export type Message = { id: string; senderId: string; recipientId: string; text: string; createdAt: string; readAt: string | null };

export type AdminStats = { students: number; coaches: number; programs: number; sessionsThisMonth: number };
export type CoachStats = { students: number; pendingEvaluations: number; completedSessions: number; todaySessions: number };
export type StudentStats = {
  completedSessions: number; attendance: number | null; syllabusProgress: number;
  currentSublevel: string | null; lastScore: number | null;
};

export type Reports = {
  totalStudents: number; graduatesThisMonth: number; passRate: number | null;
  averageScore: number | null; coachEffectiveness: number | null;
  coachPerformance: { id: string; name: string; students: number; rating: number | null; completion: number | null }[];
  recentEvaluations: Evaluation[];
};

// ── Auth ─────────────────────────────────────────────────────

export async function academyLogin(email: string, password: string, role: AcademyRole) {
  const { data } = await http.post<{ token: string; account: AcademyUser }>('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
    role,
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.account));
  return data.account;
}

export const changePassword = (currentPassword: string, newPassword: string) =>
  http.post('/auth/password', { currentPassword, newPassword }).then((r) => r.data);

// ── Query hooks ──────────────────────────────────────────────

export const useMe = () => useQuery({ queryKey: ['academy', 'me'], queryFn: () => get<AcademyUser>('/auth/me') });
export const useCoaches = () => useQuery({ queryKey: ['academy', 'coaches'], queryFn: () => get<Coach[]>('/coaches') });
export const useStudents = (search?: string) =>
  useQuery({ queryKey: ['academy', 'students', search ?? ''], queryFn: () => get<Student[]>('/students', search ? { search } : undefined) });
export const useVenues = () => useQuery({ queryKey: ['academy', 'venues'], queryFn: () => get<Venue[]>('/venues') });
export const usePrograms = () => useQuery({ queryKey: ['academy', 'programs'], queryFn: () => get<Program[]>('/programs') });
export const useLearningContent = () =>
  useQuery({ queryKey: ['academy', 'learning'], queryFn: () => get<LearningContent[]>('/learning-content') });
export const useSyllabus = (studentId?: string, enabled = true) =>
  useQuery({
    queryKey: ['academy', 'syllabus', studentId ?? 'me'],
    queryFn: () => get<SyllabusProgram[]>('/syllabus', studentId ? { studentId } : undefined),
    enabled,
  });
export const useSessions = (params?: { from?: string; to?: string; studentId?: string }) =>
  useQuery({ queryKey: ['academy', 'sessions', params ?? {}], queryFn: () => get<Session[]>('/sessions', params) });
export const useEvaluations = (params?: { status?: 'pending' | 'completed'; studentId?: string }) =>
  useQuery({ queryKey: ['academy', 'evaluations', params ?? {}], queryFn: () => get<Evaluation[]>('/evaluations', params) });
export const useContacts = () =>
  useQuery({ queryKey: ['academy', 'contacts'], queryFn: () => get<Contact[]>('/messages/contacts'), refetchInterval: 15_000 });
export const useConversation = (otherId?: string) =>
  useQuery({
    queryKey: ['academy', 'conversation', otherId],
    queryFn: () => get<Message[]>(`/messages/${otherId}`),
    enabled: !!otherId,
    refetchInterval: 5_000,
  });
export const useStats = <T,>() => useQuery({ queryKey: ['academy', 'stats'], queryFn: () => get<T>('/stats') });
export type FeedbackRow = { id: string; rating: number; category: string; message: string; createdAt: string; account: { id: string; name: string; role: string } };
export const useFeedbackList = () => useQuery({ queryKey: ['academy', 'feedback'], queryFn: () => get<FeedbackRow[]>('/feedback') });
export const useReports = () => useQuery({ queryKey: ['academy', 'reports'], queryFn: () => get<Reports>('/reports') });

// ── Mutations ────────────────────────────────────────────────

function useInvalidating<TVars, TData>(fn: (v: TVars) => Promise<TData>, keys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: ['academy', k] })),
  });
}

export const useBookSession = () =>
  useInvalidating(
    (v: { coachId: string; studentId?: string; venueId?: string; programId?: string; startsAt: string; endsAt?: string; type?: string; topic?: string }) =>
      http.post('/sessions', v).then((r) => r.data),
    ['sessions', 'stats', 'me'],
  );

export const useUpdateSessionStatus = () =>
  useInvalidating(
    (v: { id: string; status: SessionStatus }) => http.patch(`/sessions/${v.id}/status`, { status: v.status }).then((r) => r.data),
    ['sessions', 'stats', 'evaluations', 'me'],
  );

export const useCompleteEvaluation = () =>
  useInvalidating(
    (v: { id: string; score: number; notes?: string }) =>
      http.patch(`/evaluations/${v.id}`, { score: v.score, notes: v.notes }).then((r) => r.data),
    ['evaluations', 'stats', 'reports'],
  );

export const useUpdateProgress = () =>
  useInvalidating(
    (v: { studentId: string; lessonId: string; status: 'LOCKED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' }) =>
      http.put('/progress', v).then((r) => r.data),
    ['syllabus', 'stats'],
  );

export const useSendMessage = (otherId?: string) =>
  useInvalidating((text: string) => http.post(`/messages/${otherId}`, { text }).then((r) => r.data), ['conversation', 'contacts']);

export const useCreateAccount = () =>
  useInvalidating(
    (v: { email: string; name: string; role: 'STUDENT' | 'COACH' | 'ADMIN'; password: string; specialty?: string; coachId?: string; programId?: string; packageName?: string; remainingSessions?: number }) =>
      http.post('/accounts', v).then((r) => r.data),
    ['coaches', 'students', 'stats', 'reports'],
  );

export const useAssignCoach = () =>
  useInvalidating(
    (v: { studentId: string; coachId: string | null }) => http.patch(`/students/${v.studentId}/coach`, { coachId: v.coachId }).then((r) => r.data),
    ['coaches', 'students'],
  );

export const useSetAccountActive = () =>
  useInvalidating(
    (v: { id: string; active: boolean }) => http.patch(`/accounts/${v.id}/active`, { active: v.active }).then((r) => r.data),
    ['coaches', 'students', 'stats'],
  );

export const useSendFeedback = () =>
  useInvalidating(
    (v: { rating: number; category: string; message: string }) => http.post('/feedback', v).then((r) => r.data),
    ['feedback'],
  );

// ── Formatting helpers ───────────────────────────────────────

export const initials = (name?: string | null) =>
  (name ?? '?').split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const tz = undefined; // browser local time
export const fmtDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: tz });
export const fmtTime = (iso: string | Date) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
export const fmtRelative = (iso: string | null) => {
  if (!iso) return 'Belum pernah';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari yang lalu`;
  if (days < 14) return 'Minggu lalu';
  return fmtDate(iso);
};
export const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
