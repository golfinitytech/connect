import React, { useState } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  FileText, 
  PlayCircle, 
  BarChart3, 
  CalendarRange,
  MoreVertical,
  CheckCircle2,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fmtRelative, fmtTime, getPortalUser, initials, useEvaluations, useMe, useSessions, useStats, useStudents } from '../../services/academyApi';
import type { CoachStats } from '../../services/academyApi';
import { QueryState } from './shared';

const CoachDashboard = () => {
  const [selectedTab, setSelectedTab] = useState<'today' | 'upcoming'>('today');
  const navigate = useNavigate();
  const { data: me } = useMe();
  const user = me ?? getPortalUser();
  const { data: st } = useStats<CoachStats>();
  const { data: sessions, isLoading: sessLoading, error: sessError } = useSessions();
  const { data: pending } = useEvaluations({ status: 'pending' });
  const { data: completedEvals } = useEvaluations({ status: 'completed' });
  const { data: students } = useStudents();

  const coachName = user?.name || 'Coach';
  const coachInitials = initials(user?.name ?? 'C');
  const coachImage = user?.avatarUrl;

  const stats = [
    { label: 'Daftar Murid', value: st?.students ?? '…', icon: <Users className="text-blue-600" />, bg: 'bg-blue-50', to: 'students' },
    { label: 'Evaluasi Pending', value: st?.pendingEvaluations ?? '…', icon: <ClipboardCheck className="text-amber-600" />, bg: 'bg-amber-50', to: 'evaluations' },
    { label: 'Sesi Selesai', value: st?.completedSessions ?? '…', icon: <CheckCircle2 className="text-emerald-600" />, bg: 'bg-emerald-50', to: 'schedule' },
    { label: 'Jadwal Hari Ini', value: st?.todaySessions ?? '…', icon: <Clock className="text-purple-600" />, bg: 'bg-purple-50', to: 'schedule' },
  ];

  const now = Date.now();
  const todayKey = new Date().toDateString();
  const active = (sessions ?? []).filter((x) => x.status !== 'CANCELLED' && x.status !== 'COMPLETED');
  const todaySchedule = (selectedTab === 'today'
    ? active.filter((x) => new Date(x.startsAt).toDateString() === todayKey)
    : active.filter((x) => new Date(x.startsAt).getTime() > now && new Date(x.startsAt).toDateString() !== todayKey).slice(0, 6)
  ).map((x) => {
    const live = x.status === 'ONGOING' || (new Date(x.startsAt).getTime() <= now && new Date(x.endsAt).getTime() > now);
    return {
      id: x.id,
      student: x.student.name,
      time: fmtTime(x.startsAt),
      day: new Date(x.startsAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      type: x.type,
      location: x.venue?.name ?? x.location ?? '-',
      status: live ? 'ongoing' : 'upcoming',
    };
  });

  const avgProgress = students?.length ? Math.round(students.reduce((t, s) => t + s.syllabusProgress, 0) / students.length) : null;
  const withAttendance = (students ?? []).filter((s) => s.attendance != null);
  const avgAttendance = withAttendance.length ? Math.round(withAttendance.reduce((t, s) => t + (s.attendance ?? 0), 0) / withAttendance.length) : null;
  const scored = (completedEvals ?? []).filter((e) => e.score != null);
  const avgScore = scored.length ? Math.round(scored.reduce((t, e) => t + (e.score ?? 0), 0) / scored.length) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Utama</h1>
          <p className="text-gray-500 mt-2 text-lg">Halo, Coach {coachName.split(' ')[0]}. Berikut ringkasan aktivitas Anda hari ini.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-[#004d40] flex items-center justify-center text-white font-bold overflow-hidden">
            {coachImage ? (
              <img src={coachImage} alt={coachName} className="w-full h-full object-cover" />
            ) : (
              coachInitials
            )}
          </div>
          <div className="pr-4">
            <p className="text-sm font-bold text-gray-900 leading-none">{coachName}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">{user?.specialty ?? 'Coach'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} onClick={() => navigate(`/portalakademik/coach/${stat.to}`)} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Schedule & Guide */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Schedule Section */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex p-1 bg-gray-50 rounded-xl">
                  <button 
                    onClick={() => setSelectedTab('today')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === 'today' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Jadwal Hari Ini
                  </button>
                  <button 
                    onClick={() => setSelectedTab('upcoming')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === 'upcoming' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Akan Datang
                  </button>
                </div>
              </div>
              <button onClick={() => navigate('/portalakademik/coach/schedule')} className="text-emerald-600 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                Lihat Kalender <ChevronRight size={16} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <QueryState isLoading={sessLoading} error={sessError} isEmpty={!sessLoading && !sessError && todaySchedule.length === 0} emptyText={selectedTab === 'today' ? 'Tidak ada jadwal hari ini.' : 'Belum ada jadwal mendatang.'} />
              {todaySchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-sm ${item.status === 'ongoing' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                      <span className="text-[10px] opacity-70 uppercase tracking-tighter">{selectedTab === 'today' ? 'Time' : item.day.split(' ')[0]}</span>
                      {item.time}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.student}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <MapPin size={10} /> {item.location}
                        </span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.status === 'ongoing' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">LIVE</span>
                    )}
                    <button onClick={() => navigate('/portalakademik/coach/schedule')} className="p-2 hover:bg-white rounded-xl text-gray-300 hover:text-emerald-600 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guide & Reports Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[40px] text-white shadow-lg relative overflow-hidden group cursor-pointer">
              <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700">
                <PlayCircle size={140} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <PlayCircle size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Training Session Guide</h3>
                <p className="text-emerald-50/70 text-sm mb-6">Panduan materi latihan untuk sesi hari ini.</p>
                <button onClick={() => navigate('/portalakademik/coach/syllabus')} className="bg-white text-emerald-900 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-50 transition-all">
                  BUKA PANDUAN
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all cursor-pointer">
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Session Report</h3>
                <p className="text-gray-500 text-sm">Buat laporan harian hasil latihan murid.</p>
              </div>
              <button onClick={() => navigate('/portalakademik/coach/evaluations')} className="w-full mt-8 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                BUAT LAPORAN
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Evaluations & Stats & Availability */}
        <div className="space-y-8">
          
          {/* Pending Evaluations */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck size={20} className="text-amber-600" />
                Evaluasi Harus Diisi
              </h3>
              <span className="w-6 h-6 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center justify-center">{pending?.length ?? 0}</span>
            </div>
            <div className="space-y-4">
              {(pending ?? []).length === 0 && <p className="text-xs text-gray-400 text-center py-4">Tidak ada evaluasi tertunda.</p>}
              {(pending ?? []).slice(0, 3).map((ev) => (
                <div key={ev.id} onClick={() => navigate('/portalakademik/coach/evaluations')} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-amber-50/50 transition-colors group cursor-pointer border border-transparent hover:border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-gray-400 group-hover:text-amber-600 text-xs shadow-sm">
                      {initials(ev.student.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{ev.student.name}</p>
                      <p className="text-[10px] text-gray-500">{ev.topic} • {fmtRelative(ev.session?.startsAt ?? ev.createdAt)}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-600 transition-all" />
                </div>
              ))}
              <button onClick={() => navigate('/portalakademik/coach/evaluations')} className="w-full py-3 text-xs font-bold text-amber-600 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors">
                Lihat Semua Antrean
              </button>
            </div>
          </div>

          {/* Student Statistics Summary */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Statistik Murid
            </h3>
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Rata-rata Progres Silabus</p>
                  <p className="text-xs font-black text-blue-700">{avgProgress == null ? '-' : `${avgProgress}%`}</p>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${avgProgress ?? 0}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-rata Skor</p>
                  <p className="text-lg font-black text-gray-900">{avgScore ?? '-'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kehadiran</p>
                  <p className="text-lg font-black text-gray-900">{avgAttendance == null ? '-' : `${avgAttendance}%`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability / Schedule Management */}
          <div className="bg-amber-500 p-8 rounded-[32px] text-white shadow-lg shadow-amber-100 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-4 -bottom-4 text-white/20 group-hover:scale-110 transition-transform duration-500">
              <CalendarRange size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-white" />
                <h3 className="text-lg font-black">Pengisian Jadwal</h3>
              </div>
              <p className="text-amber-50 text-xs mb-6 leading-relaxed">Informasikan jadwal ketersediaan atau blokir waktu saat Anda berhalangan hadir.</p>
              <button onClick={() => navigate('/portalakademik/coach/schedule')} className="bg-white text-amber-600 px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-amber-50 transition-all flex items-center gap-2">
                ISI KETERSEDIAAN <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
