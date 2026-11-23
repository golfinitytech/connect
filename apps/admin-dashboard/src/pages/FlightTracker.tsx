import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Flag, MapPin, Users } from 'lucide-react';
import api from '../services/api';
import { LiveSyncBadge, PageLoader } from '../components/ui/Loading';

type TrackedFlight = {
  id: string;
  code: string;
  number: number | null;
  flightType: string;
  startHole: number;
  startHoleSet: boolean;
  players: string[];
  caddie: { number: string | null; name: string | null } | null;
  currentHole: number | null;
  holesDone: number;
  started: boolean;
  finished: boolean;
  awaitingConfirmation: boolean;
  lastActivityAt: string | null;
};

type TrackerData = {
  tournament: { id: string; name: string; code: string | null; course: string; isFinished: boolean };
  pars: number[];
  flights: TrackedFlight[];
};

const REFRESH_MS = 10_000;
/** A flight on the course with no score activity for this long is flagged. */
const IDLE_AFTER_MS = 15 * 60_000;

type Status = 'idle' | 'waiting' | 'playing' | 'notStarted' | 'finished';

const STATUS: Record<Status, { label: string; chip: string; dot: string }> = {
  playing: { label: 'Bermain', chip: 'bg-blue-600 text-white', dot: 'bg-blue-600' },
  waiting: { label: 'Menunggu konfirmasi', chip: 'bg-amber-400 text-amber-950', dot: 'bg-amber-400' },
  idle: { label: 'Tidak aktif >15 mnt', chip: 'bg-rose-600 text-white', dot: 'bg-rose-600' },
  notStarted: { label: 'Belum mulai', chip: 'bg-slate-200 text-slate-600', dot: 'bg-slate-300' },
  finished: { label: 'Selesai', chip: 'bg-emerald-600 text-white', dot: 'bg-emerald-600' },
};

const statusOf = (f: TrackedFlight, now: number): Status => {
  if (f.finished) return 'finished';
  if (!f.started) return 'notStarted';
  if (f.lastActivityAt && now - new Date(f.lastActivityAt).getTime() > IDLE_AFTER_MS) return 'idle';
  return f.awaitingConfirmation ? 'waiting' : 'playing';
};

const ago = (iso: string | null, now: number) => {
  if (!iso) return '-';
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} dtk lalu`;
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  return `${Math.floor(s / 3600)} jam lalu`;
};

const flightName = (f: TrackedFlight) => `Flight ${f.number ?? f.code}`;

const FlightTracker = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TrackerData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [failing, setFailing] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    let refreshing = false;
    const refresh = async (silent: boolean) => {
      if (refreshing) return;
      refreshing = true;
      try {
        const res = await api.get('/tournaments/active/tracker', { silent });
        setData(res.data || null);
        setLastSyncAt(new Date());
        setFailing(false);
      } catch {
        setFailing(true); // keep showing the last data
      } finally {
        refreshing = false;
        setLoaded(true);
      }
    };
    refresh(false);
    const poll = setInterval(() => refresh(true), REFRESH_MS);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, []);

  const nowMs = now.getTime();
  const flights = data?.flights ?? [];
  const byHole = useMemo(() => {
    const map = new Map<number, TrackedFlight[]>();
    flights.forEach((f) => {
      if (f.finished || f.currentHole === null) return;
      map.set(f.currentHole, [...(map.get(f.currentHole) ?? []), f]);
    });
    return map;
  }, [flights]);
  const counts = flights.reduce<Record<Status, number>>(
    (acc, f) => ({ ...acc, [statusOf(f, nowMs)]: acc[statusOf(f, nowMs)] + 1 }),
    { playing: 0, waiting: 0, idle: 0, notStarted: 0, finished: 0 },
  );

  if (!loaded) return <PageLoader label="Memuat posisi flight..." className="min-h-[60vh]" />;

  const HoleTile = ({ hole }: { hole: number }) => {
    const here = byHole.get(hole) ?? [];
    return (
      <div className={`rounded-2xl border p-3 min-h-[112px] flex flex-col gap-2 ${here.length ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-black text-slate-800">{hole}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Par {data?.pars?.[hole - 1] ?? '-'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {here.map((f) => {
            const st = statusOf(f, nowMs);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setHighlight(f.id === highlight ? null : f.id)}
                title={`${flightName(f)} · ${STATUS[st].label}\n${f.players.join(', ')}`}
                className={`px-2 py-1 rounded-lg text-[11px] font-black ${STATUS[st].chip} ${highlight === f.id ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
              >
                F{f.number ?? f.code}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/rounds')} aria-label="Kembali" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-800 flex items-center gap-2">
              <MapPin className="text-blue-600" size={22} /> Flight Tracker
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1">
              {data ? `${data.tournament.name} · Kode ${data.tournament.code ?? '-'} · ${data.tournament.course}` : 'Tidak ada turnamen aktif'}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-slate-900 p-1 self-start md:self-auto">
          <LiveSyncBadge lastSyncAt={lastSyncAt} failing={failing} now={now} staleAfterMs={REFRESH_MS * 3} />
        </div>
      </div>

      {!data ? (
        <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-16 text-center text-slate-400 font-black uppercase tracking-widest">
          Belum ada turnamen aktif di lokasi ini
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['playing', 'waiting', 'idle', 'notStarted', 'finished'] as Status[]).map((st) => (
              <div key={st} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${STATUS[st].dot}`} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{STATUS[st].label}</p>
                  <p className="text-2xl font-black text-slate-800">{counts[st]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Course map */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Flag size={16} className="text-emerald-600" /> Posisi di Lapangan
              </h2>
              <p className="text-[11px] font-bold text-slate-400">Posisi = hole yang sedang dimainkan (hole pertama yang belum dikonfirmasi semua pemain). Klik chip untuk menandai flight di tabel.</p>
            </div>
            {[
              { label: 'Front 9', holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
              { label: 'Back 9', holes: [10, 11, 12, 13, 14, 15, 16, 17, 18] },
            ].map((nine) => (
              <div key={nine.label} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{nine.label}</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                  {nine.holes.map((h) => <HoleTile key={h} hole={h} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Flight table */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Flight</th>
                    <th className="px-5 py-4">Pemain</th>
                    <th className="px-5 py-4">Caddie</th>
                    <th className="px-5 py-4 text-center">Start</th>
                    <th className="px-5 py-4 text-center">Posisi</th>
                    <th className="px-5 py-4">Progres</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Aktivitas terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flights.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-bold">Belum ada flight.</td></tr>
                  )}
                  {flights.map((f) => {
                    const st = statusOf(f, nowMs);
                    return (
                      <tr key={f.id} className={`transition-colors ${highlight === f.id ? 'bg-blue-50' : 'hover:bg-slate-50/60'}`} onClick={() => setHighlight(f.id === highlight ? null : f.id)}>
                        <td className="px-5 py-4 font-black text-slate-800 whitespace-nowrap">
                          {flightName(f)}
                          {f.flightType && <span className="ml-2 text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{f.flightType}</span>}
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-semibold max-w-[260px]">
                          <span className="flex items-center gap-1.5"><Users size={13} className="text-slate-300 shrink-0" /><span className="truncate">{f.players.join(', ') || '-'}</span></span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {f.caddie?.name && f.caddie.name !== 'Unassigned' ? f.caddie.name : f.caddie?.number ? `No. ${f.caddie.number}` : '-'}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-slate-600" title={f.startHoleSet ? 'Start hole tercatat' : 'Start hole belum tercatat (asumsi hole 1)'}>
                          {f.startHole}{!f.startHoleSet && <span className="text-slate-300">*</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-lg font-black text-slate-800">{f.finished ? '✓' : f.currentHole ?? '-'}</span>
                        </td>
                        <td className="px-5 py-4 min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full ${STATUS[st].dot}`} style={{ width: `${(f.holesDone / 18) * 100}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-500 tabular-nums">{f.holesDone}/18</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${STATUS[st].chip}`}>{STATUS[st].label}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-300" />{ago(f.lastActivityAt, nowMs)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-[11px] font-medium text-slate-400 border-t border-slate-100">
              * Start hole belum tercatat: flight belum menginput skor, posisi diasumsikan dari hole 1.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FlightTracker;
