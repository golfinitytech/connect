import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiErrorMessage, useCoaches, useCreateAccount, usePrograms } from '../../services/academyApi';

const PACKAGES = [
  { label: '12 Sesi', remaining: 12 },
  { label: '24 Sesi', remaining: 24 },
  { label: 'Unlimited', remaining: undefined },
];

/** Admin-only: create a coach or student account. */
const AccountModal = ({ role, onClose }: { role: 'COACH' | 'STUDENT'; onClose: () => void }) => {
  const create = useCreateAccount();
  const { data: coaches } = useCoaches();
  const { data: programs } = usePrograms();
  const [form, setForm] = useState({ name: '', email: '', password: '', specialty: '', coachId: '', programId: '', pkg: '12 Sesi' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = PACKAGES.find((p) => p.label === form.pkg);
    create.mutate(
      {
        role,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        ...(role === 'COACH'
          ? { specialty: form.specialty.trim() || undefined }
          : {
              coachId: form.coachId || undefined,
              programId: form.programId || programs?.[0]?.id,
              packageName: pkg?.label,
              remainingSessions: pkg?.remaining,
            }),
      },
      { onSuccess: onClose },
    );
  };

  const field = 'w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm';
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{role === 'COACH' ? 'Tambah Pelatih Baru' : 'Daftarkan Murid Baru'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={22} className="text-gray-400" /></button>
        </div>
        <input required minLength={2} placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
        <input required type="email" placeholder="Email (dipakai untuk login)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
        <input required type="password" minLength={8} autoComplete="new-password" placeholder="Password awal (min. 8 karakter)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} />
        {role === 'COACH' ? (
          <input placeholder="Spesialisasi (mis. Short Game Expert)" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className={field} />
        ) : (
          <>
            <select value={form.coachId} onChange={(e) => setForm({ ...form, coachId: e.target.value })} className={field}>
              <option value="">Pilih pelatih (opsional)</option>
              {(coaches ?? []).filter((c) => c.status === 'ACTIVE').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className={field}>
                {(programs ?? []).map((p) => <option key={p.id} value={p.id}>{p.level} - {p.title}</option>)}
              </select>
              <select value={form.pkg} onChange={(e) => setForm({ ...form, pkg: e.target.value })} className={field}>
                {PACKAGES.map((p) => <option key={p.label}>{p.label}</option>)}
              </select>
            </div>
          </>
        )}
        {create.isError && <p className="text-sm text-red-600 font-medium">{apiErrorMessage(create.error)}</p>}
        <button disabled={create.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50">
          {create.isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
};

export default AccountModal;
