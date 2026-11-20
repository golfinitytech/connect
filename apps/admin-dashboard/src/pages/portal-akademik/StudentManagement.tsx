import React, { useState } from 'react';
import { Search, Filter, Plus, Power } from 'lucide-react';
import {
  apiErrorMessage,
  fmtRelative,
  initials,
  useAssignCoach,
  useCoaches,
  useSetAccountActive,
  useStudents,
} from '../../services/academyApi';
import AccountModal from './AccountModal';
import { QueryState } from './shared';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [levelFilter, setLevelFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const { data, isLoading, error } = useStudents();
  const { data: coaches } = useCoaches();
  const assign = useAssignCoach();
  const setActive = useSetAccountActive();
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const students = (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    level: s.program ? `${s.program.level} - ${s.program.title}` : '-',
    progress: s.syllabusProgress,
    coachId: s.coach?.id ?? '',
    coach: s.coach?.name ?? '',
    joinDate: new Date(s.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
    joinedThisMonth: new Date(s.createdAt) >= thisMonth,
    status: s.status === 'ACTIVE' ? 'Active' : 'Inactive',
    avatar: initials(s.name),
    package: s.packageName ?? '-',
    remainingSessions: s.remainingSessions == null ? '∞' : s.remainingSessions,
    lastPractice: fmtRelative(s.lastPracticeAt),
  }));
  const levels = [...new Set(students.map((s) => s.level.split(' - ')[0]).filter((l) => l !== '-'))];

  const onAssign = (studentId: string, coachId: string) =>
    assign.mutate({ studentId, coachId: coachId || null }, { onError: (e) => window.alert(apiErrorMessage(e)) });
  const onToggle = (id: string, name: string, active: boolean) => {
    if (active && !window.confirm(`Nonaktifkan ${name}? Murid tidak bisa login sampai diaktifkan lagi.`)) return;
    setActive.mutate({ id, active: !active }, { onError: (e) => window.alert(apiErrorMessage(e)) });
  };

  const q = searchTerm.toLowerCase();
  const visible = students.filter(
    (s) =>
      (!levelFilter || s.level.startsWith(levelFilter)) &&
      (s.name.toLowerCase().includes(q) ||
        s.coach.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.package.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {adding && <AccountModal role="STUDENT" onClose={() => setAdding(false)} />}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Murid</h1>
          <p className="text-gray-500 mt-1">Pantau progres, pendaftaran, dan status keanggotaan murid.</p>
        </div>
        <button onClick={() => setAdding(true)} className="bg-[#004d40] hover:bg-[#003d33] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 w-fit">
          <Plus size={18} /> Daftarkan Murid Baru
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Murid', value: students.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktif', value: students.filter(s => s.status === 'Active').length.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Level 1', value: students.filter(s => s.level.startsWith('Level 1')).length.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Baru Bulan Ini', value: students.filter(s => s.joinedThisMonth).length.toString(), color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama murid, coach, atau level..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <label className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
            <Filter size={18} />
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-transparent outline-none">
              <option value="">Semua Level</option>
              {levels.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && visible.length === 0} emptyText="Tidak ada murid ditemukan." />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Murid</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level Murid</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paket Sesi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Riwayat Latihan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pelatih</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible
                .map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-[10px] text-gray-500">Joined {student.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-gray-700">{student.level}</p>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${student.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900">{student.package}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Sisa: {student.remainingSessions} Sesi</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-sm text-gray-600 font-medium">{student.lastPractice}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      aria-label={`Pelatih ${student.name}`}
                      value={student.coachId}
                      disabled={assign.isPending}
                      onChange={(e) => onAssign(student.id, e.target.value)}
                      className="text-sm text-gray-700 font-medium bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Belum ada</option>
                      {(coaches ?? []).filter((c) => c.status === 'ACTIVE' || c.id === student.coachId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggle(student.id, student.name, student.status === 'Active')}
                        disabled={setActive.isPending}
                        className={`p-2 rounded-lg transition-colors ${student.status === 'Active' ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-600'}`}
                        title={student.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50/30 border-t border-gray-50">
          <p className="text-xs text-gray-500 font-medium">Menampilkan {visible.length} dari {students.length} murid</p>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
