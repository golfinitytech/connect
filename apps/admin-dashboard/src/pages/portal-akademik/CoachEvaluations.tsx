import React, { useState } from 'react';
import { Search, Star, Calendar, Clock, CheckCircle2, Plus, X } from 'lucide-react';
import {
  apiErrorMessage,
  fmtDate,
  fmtTime,
  initials,
  useCompleteEvaluation,
  useEvaluations,
} from '../../services/academyApi';
import type { Evaluation } from '../../services/academyApi';
import { QueryState } from './shared';

const GradeModal = ({ ev, onClose }: { ev: Evaluation; onClose: () => void }) => {
  const complete = useCompleteEvaluation();
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const n = Number(score);
  const valid = score !== '' && n >= 0 && n <= 100;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    complete.mutate({ id: ev.id, score: n, notes: notes.trim() || undefined }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Beri Nilai • {ev.student.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{ev.topic}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400">
            <X size={20} />
          </button>
        </div>
        <label className="block">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skor (0-100)</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            required
            autoFocus
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catatan untuk murid</span>
          <textarea
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Apa yang sudah bagus, apa yang perlu dilatih..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </label>
        {complete.isError && <p className="text-sm text-red-600 font-medium">{apiErrorMessage(complete.error)}</p>}
        <button
          disabled={!valid || complete.isPending}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold disabled:opacity-50"
        >
          {complete.isPending ? 'Menyimpan...' : 'Simpan Evaluasi'}
        </button>
      </form>
    </div>
  );
};

const CoachEvaluations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [grading, setGrading] = useState<Evaluation | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, error } = useEvaluations();
  const evaluations = data ?? [];
  const pending = evaluations.filter((e) => e.status === 'PENDING');
  const completed = evaluations.filter((e) => e.status === 'COMPLETED');
  const scored = completed.filter((e) => e.score != null);
  const avg = scored.length ? scored.reduce((t, e) => t + (e.score ?? 0), 0) / scored.length : null;

  const q = searchTerm.toLowerCase();
  const filteredEvaluations = (activeTab === 'pending' ? pending : completed).filter(
    (ev) => ev.student.name.toLowerCase().includes(q) || ev.topic.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {grading && <GradeModal ev={grading} onClose={() => setGrading(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Evaluasi Murid</h1>
          <p className="text-gray-500 mt-1">Berikan penilaian dan masukan untuk sesi latihan yang telah selesai.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs font-bold text-gray-600">{pending.length} Perlu Evaluasi</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Menunggu Penilaian</p>
            <p className="text-2xl font-black text-gray-900">{pending.length} Sesi</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telah Dievaluasi</p>
            <p className="text-2xl font-black text-gray-900">{completed.length} Sesi</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-rata Skor</p>
            <p className="text-2xl font-black text-gray-900">{avg == null ? '-' : avg.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex p-1 bg-gray-50 rounded-2xl w-full md:w-fit">
          {(['pending', 'completed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'pending' ? 'Belum Dinilai' : 'Selesai'}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari murid atau topik sesi..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <QueryState isLoading={isLoading} error={error} />

      {/* Evaluation List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvaluations.map((ev) => {
          const when = ev.session?.startsAt ?? ev.createdAt;
          return (
            <div key={ev.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-emerald-100 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                    {initials(ev.student.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{ev.student.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {ev.levelLabel ?? (ev.student.program ? `${ev.student.program.level} - ${ev.student.program.title}` : '-')}
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Topik Sesi</p>
                    <p className="text-sm font-bold text-gray-800">{ev.topic}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Waktu Sesi</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Calendar size={14} className="text-gray-400" />
                      {fmtDate(when)} • {fmtTime(when)}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ev.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {ev.status === 'PENDING' ? 'Perlu Dinilai' : 'Selesai'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {ev.status === 'PENDING' ? (
                    <button
                      onClick={() => setGrading(ev)}
                      className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> Beri Nilai
                    </button>
                  ) : (
                    <button
                      onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                      className="text-right p-2 rounded-xl hover:bg-gray-50"
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skor</p>
                      <div className="flex items-center gap-1 text-emerald-600 font-black">
                        <Star size={14} fill="currentColor" /> {ev.score}/100
                      </div>
                    </button>
                  )}
                </div>
              </div>
              {expanded === ev.id && (
                <p className="mt-4 p-4 rounded-2xl bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap">
                  {ev.notes || 'Tidak ada catatan.'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!isLoading && !error && filteredEvaluations.length === 0 && activeTab === 'pending' && (
        <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Semua Selesai!</h3>
          <p className="text-gray-500">Tidak ada sesi yang menunggu evaluasi saat ini.</p>
        </div>
      )}
    </div>
  );
};

export default CoachEvaluations;
