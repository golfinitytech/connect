import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  CheckCircle2,
  LayoutGrid,
  List,
  Search,
  X,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import {
  apiErrorMessage,
  fmtTime,
  getPortalUser,
  initials,
  localDateKey,
  useBookSession,
  useSessions,
  useStudents,
  useUpdateSessionStatus,
  useVenues,
} from '../../services/academyApi';
import type { Session, SessionStatus } from '../../services/academyApi';
import { QueryState } from './shared';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
};

const AddSessionModal = ({ date, onClose }: { date: string; onClose: () => void }) => {
  const me = getPortalUser();
  const { data: students } = useStudents();
  const { data: venues } = useVenues();
  const book = useBookSession();
  const [form, setForm] = useState({ studentId: '', venueId: '', date, time: '09:00', duration: '90', type: 'Private', topic: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    const startsAt = new Date(`${form.date}T${form.time}:00`);
    const endsAt = new Date(startsAt.getTime() + Number(form.duration) * 60_000);
    book.mutate(
      {
        coachId: me.id,
        studentId: form.studentId,
        venueId: form.venueId || undefined,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        type: form.type,
        topic: form.topic || undefined,
      },
      { onSuccess: onClose },
    );
  };

  const field = 'w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm';
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-900">Tambah Jadwal</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400"><X size={20} /></button>
        </div>
        <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className={field}>
          <option value="">Pilih murid</option>
          {(students ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-3">
          <input type="date" required min={localDateKey(new Date())} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={`${field} col-span-1`} />
          <input type="time" required step={900} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={field} />
          <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={field}>
            {[60, 90, 120].map((m) => <option key={m} value={m}>{m} menit</option>)}
          </select>
        </div>
        <select value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} className={field}>
          <option value="">Pilih venue (opsional)</option>
          {(venues ?? []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Tipe (mis. On-Field Training)" maxLength={80} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={field} />
          <input placeholder="Topik (opsional)" maxLength={200} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={field} />
        </div>
        {book.isError && <p className="text-sm text-red-600 font-medium">{apiErrorMessage(book.error)}</p>}
        <button disabled={book.isPending || !form.studentId} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold disabled:opacity-50">
          {book.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
        </button>
      </form>
    </div>
  );
};

const statusOf = (s: Session): 'ongoing' | 'upcoming' | 'completed' | 'cancelled' => {
  if (s.status === 'COMPLETED') return 'completed';
  if (s.status === 'CANCELLED') return 'cancelled';
  const now = Date.now();
  if (s.status === 'ONGOING' || (new Date(s.startsAt).getTime() <= now && new Date(s.endsAt).getTime() > now)) return 'ongoing';
  return 'upcoming';
};

const CoachSchedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [adding, setAdding] = useState(false);

  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  const { data, isLoading, error } = useSessions({ from: weekStart.toISOString(), to: weekEnd.toISOString() });
  const update = useUpdateSessionStatus();

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return { d, day: DAY_SHORT[d.getDay()], date: String(d.getDate()).padStart(2, '0'), key: localDateKey(d) };
      }),
    [weekStart],
  );

  const selectedKey = localDateKey(selectedDate);
  const q = search.trim().toLowerCase();
  const filteredSchedules = (data ?? []).filter(
    (s) => localDateKey(new Date(s.startsAt)) === selectedKey && (!q || s.student.name.toLowerCase().includes(q)),
  );
  const countByDay = (key: string) => (data ?? []).filter((s) => localDateKey(new Date(s.startsAt)) === key && s.status !== 'CANCELLED').length;

  const shiftWeek = (dir: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    setWeekStart(next);
    setSelectedDate(next);
  };

  const setStatus = (id: string, status: SessionStatus, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    update.mutate({ id, status }, { onError: (e) => window.alert(apiErrorMessage(e)) });
  };

  const isToday = selectedKey === localDateKey(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {adding && <AddSessionModal date={selectedKey < localDateKey(new Date()) ? localDateKey(new Date()) : selectedKey} onClose={() => setAdding(false)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Jadwal Pelatihan</h1>
          <p className="text-gray-500 mt-1">Kelola sesi latihan Anda dan pantau kehadiran murid.</p>
        </div>
        <div className="flex items-center gap-3">
          {showSearch && (
            <input
              autoFocus
              placeholder="Cari murid..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            />
          )}
          <button onClick={() => setShowSearch((v) => !v)} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Search size={20} />
          </button>
          <button onClick={() => setAdding(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
            <Plus size={18} /> Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => shiftWeek(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => shiftWeek(1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="flex p-1 bg-gray-50 rounded-2xl">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>
              <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>
              <List size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {days.map((day) => {
            const active = day.key === selectedKey;
            const count = countByDay(day.key);
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDate(day.d)}
                className={`flex flex-col items-center p-2 sm:p-4 rounded-2xl transition-all group ${
                  active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' : 'hover:bg-emerald-50 text-gray-500'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${active ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-400'}`}>
                  {day.day}
                </span>
                <span className="text-lg font-black">{day.date}</span>
                {count > 0 && <div className={`w-1.5 h-1.5 rounded-full mt-2 ${active ? 'bg-white' : 'bg-emerald-500'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" />
            {isToday ? 'Sesi Hari Ini' : `Sesi ${selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}`}
          </h3>
          <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {filteredSchedules.filter((s) => s.status !== 'CANCELLED').length} Sesi Terjadwal
          </p>
        </div>

        <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && filteredSchedules.length === 0} emptyText="Tidak ada sesi di hari ini." />

        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredSchedules.map((session) => {
            const status = statusOf(session);
            return (
              <div key={session.id} className={`bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-emerald-100 transition-all group relative overflow-hidden ${status === 'cancelled' ? 'opacity-60' : ''}`}>
                {status === 'ongoing' && <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />}

                <div className={`flex flex-col ${viewMode === 'list' ? 'lg:flex-row lg:items-center' : ''} justify-between gap-6`}>
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-xl text-emerald-600 border border-gray-100">
                      {initials(session.student.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{session.student.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          {session.program?.level ?? session.student.program?.level ?? '-'}
                        </span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs text-gray-500 font-medium">{session.topic ?? session.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Sesi</p>
                        <p className="text-sm font-bold text-gray-800">{fmtTime(session.startsAt)} - {fmtTime(session.endsAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lokasi</p>
                        <p className="text-sm font-bold text-gray-800">{session.venue?.name ?? session.location ?? '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="lg:text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        status === 'ongoing' ? 'bg-emerald-500 text-white animate-pulse' :
                        status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {status === 'ongoing' ? 'Sedang Berjalan' : status === 'upcoming' ? 'Akan Datang' : status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'upcoming' && session.status === 'UPCOMING' && (
                        <>
                          <button
                            disabled={update.isPending}
                            onClick={() => setStatus(session.id, 'ONGOING')}
                            title="Mulai sesi"
                            className="p-3 bg-gray-50 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors border border-gray-100"
                          >
                            <PlayCircle size={20} />
                          </button>
                          <button
                            disabled={update.isPending}
                            onClick={() => setStatus(session.id, 'CANCELLED', `Batalkan sesi ${session.student.name}?`)}
                            title="Batalkan sesi"
                            className="p-3 bg-gray-50 hover:bg-red-50 text-red-500 rounded-xl transition-colors border border-gray-100"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                      {(status === 'ongoing' || (status === 'upcoming' && new Date(session.endsAt).getTime() < Date.now())) && (
                        <button
                          disabled={update.isPending}
                          onClick={() => setStatus(session.id, 'COMPLETED')}
                          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 size={18} /> Selesaikan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-700">
          <Users size={180} />
        </div>
        <h3 className="text-xl font-bold mb-2 relative z-10">Hubungi Murid</h3>
        <p className="text-emerald-100/80 text-sm mb-6 max-w-xs relative z-10">Kirim pengingat atau info sesi ke murid Anda lewat Messages.</p>
        <button onClick={() => navigate('/portalakademik/coach/messages')} className="relative z-10 bg-white text-emerald-900 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-50 transition-all">
          Buka Messages
        </button>
      </div>
    </div>
  );
};

export default CoachSchedule;
