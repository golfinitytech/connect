import React, { useState } from 'react';
import { AlertTriangle, Layers, Plus, RotateCcw, Settings2, Trash2 } from 'lucide-react';
import {
  DEFAULT_GROUPING_RULES,
  describeRules,
  MIX_RULE_LABEL,
  sortedFlights,
  validateRules,
} from '../lib/flightRules';
import type { FlightRule, GroupingRules, MixRule } from '../lib/flightRules';

const input =
  'w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

/** Summary card of the auto-grouping rules with an inline editor. */
const GroupingRulesEditor = ({
  rules,
  onChange,
  warnings = [],
}: {
  rules: GroupingRules;
  onChange: (rules: GroupingRules) => void;
  /** Problems found while grouping the current players with these rules. */
  warnings?: string[];
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<GroupingRules>(rules);
  const [fixedText, setFixedText] = useState('');
  const problems = validateRules(draft);

  const open = () => {
    setDraft(rules);
    setFixedText(rules.fixedGroups.map((g) => g.join(', ')).join('\n'));
    setEditing(true);
  };
  const save = () => {
    const fixedGroups = fixedText
      .split('\n')
      .map((line) => line.split(',').map((n) => n.trim()).filter(Boolean))
      .filter((g) => g.length > 0);
    onChange({ ...draft, flights: sortedFlights(draft), fixedGroups });
    setEditing(false);
  };
  const setFlight = (i: number, patch: Partial<FlightRule>) =>
    setDraft({ ...draft, flights: draft.flights.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const addFlight = () => {
    const last = sortedFlights(draft).at(-1);
    const id = String.fromCharCode(65 + draft.flights.length); // A, B, C, D...
    const min = last ? last.maxHcp + 1 : 0;
    setDraft({
      ...draft,
      flights: [...draft.flights, { id, label: `Flight ${id}`, minHcp: min, maxHcp: min + 7, pool: (last?.pool ?? 0) + 1 }],
    });
  };
  const poolOptions = Array.from({ length: Math.max(draft.flights.length, 1) }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
            <Layers className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-widest text-slate-800">Auto-Grouping Rules</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {editing ? 'Ubah aturan, lalu simpan' : 'Sistem akan membagi pemain sesuai aturan ini'}
            </p>
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={open}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest"
          >
            <Settings2 size={16} /> Atur Aturan
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {describeRules(rules).map((rule, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-600 leading-relaxed">{rule}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Flights */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Flight & Rentang HCP</h3>
            <div className="hidden md:grid grid-cols-[80px_1fr_110px_110px_150px_44px] gap-3 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Kode</span><span>Nama</span><span>HCP min</span><span>HCP maks</span><span>Kelompok campur</span><span />
            </div>
            {draft.flights.map((f, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-[80px_1fr_110px_110px_150px_44px] gap-3 items-center">
                <input aria-label="Kode flight" className={input} maxLength={3} value={f.id} onChange={(e) => setFlight(i, { id: e.target.value.toUpperCase() })} />
                <input aria-label="Nama flight" className={input} value={f.label} onChange={(e) => setFlight(i, { label: e.target.value })} />
                <input aria-label="HCP minimal" type="number" className={input} value={f.minHcp} onChange={(e) => setFlight(i, { minHcp: Number(e.target.value) })} />
                <input aria-label="HCP maksimal" type="number" className={input} value={f.maxHcp} onChange={(e) => setFlight(i, { maxHcp: Number(e.target.value) })} />
                <select aria-label="Kelompok campur" className={input} value={f.pool} onChange={(e) => setFlight(i, { pool: Number(e.target.value) })}>
                  {poolOptions.map((n) => <option key={n} value={n}>Kelompok {n}</option>)}
                </select>
                <button
                  type="button"
                  aria-label={`Hapus ${f.label}`}
                  disabled={draft.flights.length <= 1}
                  onClick={() => setDraft({ ...draft, flights: draft.flights.filter((_, j) => j !== i) })}
                  className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={addFlight} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700">
                <Plus size={14} /> Tambah flight
              </button>
              <p className="text-[11px] font-medium text-slate-400">Flight dengan <b>kelompok campur</b> yang sama boleh berada dalam satu grup.</p>
            </div>
          </section>

          {/* Group size + mix rule */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Min pemain / grup</span>
              <input type="number" min={1} max={8} className={input} value={draft.minPerGroup} onChange={(e) => setDraft({ ...draft, minPerGroup: Number(e.target.value) })} />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Maks pemain / grup</span>
              <input type="number" min={1} max={8} className={input} value={draft.maxPerGroup} onChange={(e) => setDraft({ ...draft, maxPerGroup: Number(e.target.value) })} />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Komposisi grup campuran</span>
              <select className={input} value={draft.mixRule} onChange={(e) => setDraft({ ...draft, mixRule: e.target.value as MixRule })}>
                {(Object.keys(MIX_RULE_LABEL) as MixRule[]).map((k) => <option key={k} value={k}>{MIX_RULE_LABEL[k]}</option>)}
              </select>
            </label>
          </section>

          {/* Fixed groups */}
          <section className="space-y-2">
            <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Grup tetap (opsional)</span>
            <textarea
              rows={3}
              className={`${input} font-medium`}
              placeholder={'Satu grup per baris, nama dipisah koma. Contoh:\nAnang, Ikbal, Effendi, Budiman\nMang JP, Dylan'}
              value={fixedText}
              onChange={(e) => setFixedText(e.target.value)}
            />
            <p className="text-[11px] font-medium text-slate-400">Pemain di satu baris selalu ditaruh di grup yang sama, apa pun flight-nya.</p>
          </section>

          {problems.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-1">
              {problems.map((p, i) => (
                <p key={i} className="flex items-start gap-2 text-xs font-bold text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{p}</p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setDraft(DEFAULT_GROUPING_RULES);
                setFixedText('');
              }}
              className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-700"
            >
              <RotateCcw size={14} /> Reset ke default
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100">
                Batal
              </button>
              <button
                type="button"
                onClick={save}
                disabled={problems.some((p) => !p.includes('tidak masuk flight'))}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest"
              >
                Simpan Aturan
              </button>
            </div>
          </div>
        </div>
      )}

      {!editing && warnings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-2 text-xs font-bold text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{w}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupingRulesEditor;
