import React, { useMemo, useState } from 'react';
import { MapPin, Filter, Download } from 'lucide-react';
import { fmtDate, fmtTime, useEvaluations, useSessions } from '../../services/academyApi';
import type { Session } from '../../services/academyApi';
import { Avatar, QueryState, SESSION_STATUS_LABEL } from './shared';

const toCsv = (rows: Session[]) => {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [['Tanggal', 'Jam', 'Coach', 'Topik', 'Lokasi', 'Status'].join(',')];
  for (const s of rows) {
    lines.push([fmtDate(s.startsAt), fmtTime(s.startsAt), s.coach.name, s.topic ?? s.type, s.venue?.name ?? s.location ?? '', SESSION_STATUS_LABEL[s.status]].map(esc).join(','));
  }
  return lines.join('\n');
};

const SessionTracker = () => {
  const { data, isLoading, error } = useSessions();
  const { data: evals } = useEvaluations({ status: 'completed' });
  const [filter, setFilter] = useState<'all' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('all');

  // Newest first for a history view.
  const all = useMemo(() => [...(data ?? [])].reverse(), [data]);
  const sessions = filter === 'all' ? all : all.filter((s) => s.status === filter);

  const completed = all.filter((s) => s.status === 'COMPLETED');
  const totalHours = completed.reduce((h, s) => h + (new Date(s.endsAt).getTime() - new Date(s.startsAt).getTime()) / 3_600_000, 0);
  const closed = all.filter((s) => s.status === 'COMPLETED' || s.status === 'CANCELLED').length;
  const completionRate = closed ? Math.round((completed.length / closed) * 100) : null;
  const scored = (evals ?? []).filter((e) => e.score != null);
  const avgScore = scored.length ? scored.reduce((t, e) => t + (e.score ?? 0), 0) / scored.length : null;
  const stars = avgScore == null ? 0 : Math.round(avgScore / 20);

  const exportCsv = () => {
    const blob = new Blob([toCsv(sessions)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'riwayat-sesi.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Tracker</h1>
          <p className="text-gray-500 mt-1">Review your past and upcoming training sessions.</p>
        </div>
        <div className="flex gap-3">
          <label className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter size={18} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="bg-transparent outline-none">
              <option value="all">Semua</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <button onClick={exportCsv} disabled={!sessions.length} className="disabled:opacity-50 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
        <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && sessions.length === 0} emptyText="Belum ada sesi." />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#004d40] text-white">
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider first:rounded-tl-none">Session</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Date & Time</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Coach</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Topic</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Location</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session, idx) => (
                <tr key={session.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      {sessions.length - idx}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{fmtDate(session.startsAt)}</span>
                      <span className="text-xs text-gray-500 font-medium">{fmtTime(session.startsAt)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={session.coach.name} src={session.coach.avatarUrl} className="w-8 h-8 rounded-full text-xs" />
                      <span className="font-bold text-gray-700">{session.coach.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-gray-900">{session.topic ?? session.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="text-sm font-medium">{session.venue?.name ?? session.location ?? '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      session.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
                    }`}>{SESSION_STATUS_LABEL[session.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900 rounded-[32px] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <h4 className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Total Hours</h4>
          <p className="text-4xl font-bold">{totalHours.toFixed(1)}</p>
          <p className="text-emerald-300/60 text-sm mt-4 font-medium">{completed.length} sesi selesai</p>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Completion Rate</h4>
          <p className="text-4xl font-bold text-gray-900">{completionRate == null ? '-' : `${completionRate}%`}</p>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${completionRate ?? 0}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Rata-rata Nilai Evaluasi</h4>
          <p className="text-4xl font-bold text-gray-900">{avgScore == null ? '-' : Math.round(avgScore)}</p>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-6 h-6 rounded-md ${i <= stars ? 'bg-amber-400' : 'bg-gray-100'} flex items-center justify-center`}>
                <span className="text-white text-[10px]">★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTracker;
