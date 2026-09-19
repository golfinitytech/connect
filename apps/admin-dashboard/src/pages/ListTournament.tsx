import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Trophy, RefreshCcw } from 'lucide-react';

type TournamentRow = {
  id: string;
  name?: string;
  course?: string;
  date?: string;
  teeTime?: string;
  rules?: string;
  scoringMethod?: string;
  publishedAt?: string | null;
  createdAt?: string;
  groups?: any[];
  players?: any[];
};

const ListTournament = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchTournaments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/tournaments');
      setTournaments(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat data tournament');
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const { active, archived } = useMemo(() => {
    const activeList = tournaments.filter(t => !!t.publishedAt);
    const archivedList = tournaments.filter(t => !t.publishedAt);
    return { active: activeList, archived: archivedList };
  }, [tournaments]);

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatTime = (value?: string) => {
    if (!value) return '-';
    return value;
  };

  const renderRow = (t: TournamentRow, idx: number, status: 'ACTIVE' | 'ARSIP') => {
    const groupCount = Array.isArray(t.groups) ? t.groups.length : 0;
    const playerCount = Array.isArray(t.players) ? t.players.length : 0;

    return (
      <div
        key={t.id || `${status}-${idx}`}
        className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {status}
              </span>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight truncate">
                {t.name || '-'}
              </h3>
            </div>
            <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t.course || '-'} • {formatDate(t.date)} • Tee {formatTime(t.teeTime)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                Players: {playerCount}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                Groups: {groupCount}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                {t.rules || '-'} • {t.scoringMethod || '-'}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/rounds/tournament-players')}
            className="shrink-0 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
          >
            Lihat Players
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/rounds')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group border border-slate-200 shadow-sm"
            >
              <ArrowLeft size={22} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Trophy size={22} className="text-emerald-600" />
                </div>
                List Tournament
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">
                Menampilkan semua tournament yang pernah dibuat (aktif & arsip)
              </p>
            </div>
          </div>

          <button
            onClick={fetchTournaments}
            className="bg-white hover:bg-slate-50 text-slate-600 p-3 rounded-2xl transition-all border border-slate-200 shadow-sm"
          >
            <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-[24px] p-6 font-bold">
            {error}
          </div>
        )}

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Active Tournament
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {active.length} item
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {active.length > 0 ? (
                active.map((t, idx) => renderRow(t, idx, 'ACTIVE'))
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-[28px] p-10 text-center text-slate-400 font-black uppercase tracking-widest">
                  Tidak ada tournament aktif
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Arsip Tournament
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {archived.length} item
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {archived.length > 0 ? (
                archived.map((t, idx) => renderRow(t, idx, 'ARSIP'))
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-[28px] p-10 text-center text-slate-400 font-black uppercase tracking-widest">
                  Belum ada arsip tournament
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListTournament;

