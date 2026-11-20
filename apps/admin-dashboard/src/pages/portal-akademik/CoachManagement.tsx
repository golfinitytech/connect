import React, { useState } from 'react';
import { Users, Search, Plus, Star, X, CheckCircle2, Power } from 'lucide-react';
import {
  apiErrorMessage,
  initials,
  useAssignCoach,
  useCoaches,
  useSetAccountActive,
  useStudents,
} from '../../services/academyApi';
import type { Coach } from '../../services/academyApi';
import AccountModal from './AccountModal';
import { Avatar, QueryState } from './shared';

const ManageStudentsModal = ({ coach, onClose }: { coach: Coach; onClose: () => void }) => {
  const { data: students, isLoading } = useStudents();
  const assign = useAssignCoach();

  const toggle = (studentId: string, assigned: boolean) =>
    assign.mutate(
      { studentId, coachId: assigned ? null : coach.id },
      { onError: (e) => window.alert(apiErrorMessage(e)) },
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kelola Murid</h2>
              <p className="text-sm text-gray-500">Pelatih: {coach.name} • klik untuk menugaskan / melepas</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <QueryState isLoading={isLoading} isEmpty={!isLoading && (students ?? []).length === 0} emptyText="Belum ada murid terdaftar." />
            {(students ?? []).map((s) => {
              const assigned = s.coach?.id === coach.id;
              return (
                <button
                  key={s.id}
                  disabled={assign.isPending}
                  onClick={() => toggle(s.id, assigned)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left ${
                    assigned ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 shadow-sm">
                      {initials(s.name)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                        {s.coach && !assigned ? `Coach: ${s.coach.name}` : s.program?.level ?? 'Student'}
                      </p>
                    </div>
                  </div>
                  {assigned ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Plus size={20} className="text-gray-300" />}
                </button>
              );
            })}
          </div>

          <button onClick={onClose} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all">
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};

const CoachManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [managing, setManaging] = useState<Coach | null>(null);
  const [adding, setAdding] = useState(false);
  const { data, isLoading, error } = useCoaches();
  const setActive = useSetAccountActive();

  const all = data ?? [];
  const q = searchTerm.toLowerCase();
  const coaches = all.filter((c) => c.name.toLowerCase().includes(q) || (c.specialty ?? '').toLowerCase().includes(q));
  const rated = all.filter((c) => c.rating != null);
  const withCompletion = all.filter((c) => c.sessionCompletion != null);
  const avgRating = rated.length ? (rated.reduce((t, c) => t + (c.rating ?? 0), 0) / rated.length).toFixed(1) : '-';
  const avgCompletion = withCompletion.length
    ? `${Math.round(withCompletion.reduce((t, c) => t + (c.sessionCompletion ?? 0), 0) / withCompletion.length)}%`
    : '-';

  const toggleActive = (c: Coach) => {
    const active = c.status !== 'ACTIVE';
    if (!active && !window.confirm(`Nonaktifkan ${c.name}? Pelatih tidak bisa login sampai diaktifkan lagi.`)) return;
    setActive.mutate({ id: c.id, active }, { onError: (e) => window.alert(apiErrorMessage(e)) });
  };

  // Keep the open modal in sync with refreshed data.
  const managingFresh = managing ? all.find((c) => c.id === managing.id) ?? managing : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {adding && <AccountModal role="COACH" onClose={() => setAdding(false)} />}
      {managingFresh && <ManageStudentsModal coach={managingFresh} onClose={() => setManaging(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Pelatih</h1>
          <p className="text-gray-500 mt-1">Kontrol data, penugasan, dan performa pelatih akademi.</p>
        </div>
        <button onClick={() => setAdding(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 w-fit">
          <Plus size={18} /> Tambah Pelatih Baru
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelatih', value: String(all.length), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktif', value: String(all.filter((c) => c.status === 'ACTIVE').length), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Rating', value: avgRating, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Completion', value: avgCompletion, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama pelatih atau spesialisasi..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && coaches.length === 0} emptyText="Tidak ada pelatih ditemukan." />

      {/* Coach List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {coaches.map((coach) => (
          <div key={coach.id} className={`bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-all group ${coach.status !== 'ACTIVE' ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar name={coach.name} src={coach.avatarUrl} className="w-16 h-16 rounded-2xl text-xl" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{coach.name}</h3>
                  <p className="text-sm text-emerald-600 font-medium">{coach.specialty ?? '-'}</p>
                  <p className="text-xs text-gray-400">{coach.email}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                coach.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {coach.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Murid</p>
                <p className="text-lg font-bold text-gray-900">{coach.studentCount}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-lg font-bold text-gray-900">{coach.rating ?? '-'}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Completion</p>
                <p className="text-lg font-bold text-emerald-600">{coach.sessionCompletion == null ? '-' : `${coach.sessionCompletion}%`}</p>
              </div>
            </div>

            {coach.students.length > 0 && (
              <p className="text-xs text-gray-500 mb-4 truncate">Murid: {coach.students.map((s) => s.name).join(', ')}</p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
              <button
                onClick={() => setManaging(coach)}
                className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                <Users size={14} /> Kelola Murid
              </button>
              <button
                onClick={() => toggleActive(coach)}
                disabled={setActive.isPending}
                title={coach.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                className={`p-3 bg-gray-50 rounded-xl transition-all ${coach.status === 'ACTIVE' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
              >
                <Power size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachManagement;
