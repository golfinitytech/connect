import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Plus, User } from 'lucide-react';
import { apiErrorMessage, fmtTime, useSessions, useUpdateSessionStatus } from '../../services/academyApi';
import { QueryState, SESSION_STATUS_LABEL } from './shared';

const Schedule = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isLoading, error } = useSessions();
  const cancel = useUpdateSessionStatus();

  const now = Date.now();
  const list = (data ?? []).filter((s) =>
    tab === 'upcoming'
      ? (s.status === 'UPCOMING' || s.status === 'ONGOING') && new Date(s.endsAt).getTime() >= now
      : !((s.status === 'UPCOMING' || s.status === 'ONGOING') && new Date(s.endsAt).getTime() >= now),
  );
  if (tab === 'past') list.reverse();

  const book = () => navigate('/portalakademik/student/program');
  const onCancel = (id: string) => {
    if (!window.confirm('Batalkan sesi ini? Kuota sesi paket akan dikembalikan.')) return;
    cancel.mutate({ id, status: 'CANCELLED' }, { onError: (e) => window.alert(apiErrorMessage(e)) });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Schedule</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming training sessions and events.</p>
        </div>
        <button onClick={book} className="bg-[#004d40] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-[#003d33] transition-all">
          <Plus size={18} />
          Book New Session
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 pb-px">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'px-6 py-3 border-b-2 border-[#004d40] text-[#004d40] font-bold text-sm' : 'px-6 py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors'}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past Sessions'}
          </button>
        ))}
      </div>

      <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && list.length === 0 && tab === 'past'} emptyText="Belum ada riwayat sesi." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {list.map(session => {
          const d = new Date(session.startsAt);
          const mins = Math.round((new Date(session.endsAt).getTime() - d.getTime()) / 60000);
          return (
          <div key={session.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 group hover:border-emerald-500 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center text-emerald-700">
                <span className="text-xs font-bold uppercase">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                <span className="text-2xl font-black leading-none">{d.getDate()}</span>
              </div>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                {tab === 'past' ? SESSION_STATUS_LABEL[session.status] : `${session.type} Session`}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">{session.topic ?? session.type}</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <Clock size={18} className="text-emerald-600" />
                <span className="text-sm">{fmtTime(d)} ({mins} mins) • {d.toLocaleDateString('id-ID', { weekday: 'long' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <User size={18} className="text-emerald-600" />
                <span className="text-sm">{session.coach.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <MapPin size={18} className="text-emerald-600" />
                <span className="text-sm">{session.venue?.name ?? session.location ?? '-'}</span>
              </div>
            </div>

            {tab === 'upcoming' && session.status === 'UPCOMING' && (
              <div className="flex gap-3">
                <button
                  onClick={() => onCancel(session.id)}
                  disabled={cancel.isPending}
                  className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );})}

        {tab === 'upcoming' && <div onClick={book} className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-emerald-50 transition-all">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <h4 className="text-xl font-bold text-[#004d40]">Book Session</h4>
          <p className="text-sm text-emerald-600/70 mt-2 max-w-[200px]">Select a coach and time slot that works for you.</p>
        </div>}
      </div>
    </div>
  );
};


export default Schedule;
