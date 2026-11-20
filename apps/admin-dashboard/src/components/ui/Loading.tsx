import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { subscribeInFlight } from '../../services/api';

/** Inline spinner. Inherits text color. */
export const Spinner = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <Loader2 size={size} className={`animate-spin shrink-0 ${className}`} aria-hidden />
);

/** Centered loader for a page or section while its first data loads. */
export const PageLoader = ({ label = 'Memuat data...', className = '' }: { label?: string; className?: string }) => (
  <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-400 ${className}`}>
    <Spinner size={28} className="text-emerald-600" />
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </div>
);

/** Full-screen blocking overlay for critical operations (publish, delete, save scores). */
export const LoadingOverlay = ({ show, label = 'Memproses...' }: { show: boolean; label?: string }) =>
  show ? (
    <div
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] cursor-wait"
    >
      <div className="flex items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl">
        <Spinner size={24} className="text-emerald-600" />
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
    </div>
  ) : null;

/**
 * Thin bar at the top of the viewport while any non-silent API request is in flight.
 * Appears after a short delay so instant requests don't flash it.
 */
export const GlobalProgressBar = () => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let timer: number | undefined;
    const unsub = subscribeInFlight((n) => {
      window.clearTimeout(timer);
      if (n > 0) timer = window.setTimeout(() => setActive(true), 150);
      else setActive(false);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);
  if (!active) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] h-1 overflow-hidden bg-emerald-100 pointer-events-none" role="progressbar" aria-label="Memuat">
      <div className="h-full w-1/3 bg-emerald-600 animate-[progress_1.1s_ease-in-out_infinite]" />
    </div>
  );
};

/**
 * Wraps an async action: exposes `pending` for UI and ignores re-entry while running
 * (blocks double clicks even before React re-renders the disabled button).
 */
export function useAsyncAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const running = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    if (running.current) return undefined;
    running.current = true;
    setPending(true);
    try {
      return await fnRef.current(...args);
    } finally {
      running.current = false;
      setPending(false);
    }
  }, []);
  return { run, pending };
}

/** Same as useAsyncAction but tracks pending per key (e.g. one row's button in a list). */
export function useKeyedAsyncAction<K extends string | number, A extends unknown[], R>(
  fn: (key: K, ...args: A) => Promise<R>,
) {
  const [pendingKeys, setPendingKeys] = useState<Set<K>>(new Set());
  const running = useRef(new Set<K>());
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async (key: K, ...args: A): Promise<R | undefined> => {
    if (running.current.has(key)) return undefined;
    running.current.add(key);
    setPendingKeys(new Set(running.current));
    try {
      return await fnRef.current(key, ...args);
    } finally {
      running.current.delete(key);
      setPendingKeys(new Set(running.current));
    }
  }, []);
  return { run, isPending: (key: K) => pendingKeys.has(key), anyPending: pendingKeys.size > 0 };
}

// ── Always-on boards (leaderboard / TV monitor) ─────────────────────────────
// These screens stay open for hours, so they never cover content with a loader:
// they keep showing the last data, refresh silently, and only report sync health.

/** Placeholder rows shown in the table area only while a board has no data at all yet. */
export const BoardSkeleton = ({ rows = 6, label = 'Memuat leaderboard...' }: { rows?: number; label?: string }) => (
  <div role="status" aria-live="polite" aria-label={label} className="px-4 md:px-6 lg:px-10 py-4 space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 h-12 rounded-xl bg-white/[0.04] px-4 animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>
        <div className="h-4 w-8 rounded bg-white/10" />
        <div className="h-4 flex-1 max-w-[240px] rounded bg-white/10" />
        <div className="ml-auto h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
      </div>
    ))}
    <p className="pt-2 text-center text-[10px] font-black uppercase tracking-[0.25em] text-white/40">{label}</p>
  </div>
);

/**
 * Small sync-health chip for live boards. Green "LIVE" while data is fresh, amber with the
 * time of the last good data when refreshes fail or stall. Never blocks the screen.
 */
export const LiveSyncBadge = ({
  lastSyncAt,
  failing,
  now,
  staleAfterMs = 20_000,
}: {
  lastSyncAt: Date | null;
  failing: boolean;
  now: Date;
  staleAfterMs?: number;
}) => {
  const stale = !lastSyncAt || failing || now.getTime() - lastSyncAt.getTime() > staleAfterMs;
  const time = lastSyncAt?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (!lastSyncAt && !failing) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/60" role="status">
        <Spinner size={10} /> Menyambungkan...
      </span>
    );
  }
  return (
    <span
      role="status"
      aria-live="polite"
      title={stale ? 'Data mungkin tidak terbaru' : 'Data tersinkron'}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest tabular-nums ${
        stale ? 'border-amber-400/40 bg-amber-500/15 text-amber-300' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {!stale && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${stale ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      </span>
      {stale ? `Data ${time ?? '-'} · menyambung ulang` : `Live · ${time}`}
    </span>
  );
};
