import React, { useState } from 'react';
import { Mail, Phone, Shield, ChevronRight, Users, CheckCircle2 } from 'lucide-react';
import { apiErrorMessage, changePassword, getPortalUser, initials, useMe, useStats } from '../../services/academyApi';
import type { CoachStats, StudentStats } from '../../services/academyApi';

const Profile = () => {
  const { data: me } = useMe();
  const user = me ?? getPortalUser();
  const { data: stats } = useStats<StudentStats & CoachStats>();
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const userInfo = {
    name: user?.name || 'User',
    role: user?.role === 'admin'
      ? 'Hub Director'
      : user?.role === 'coach'
        ? (user.specialty ?? 'Coach')
        : `Student${user?.program ? ` • ${user.program.level}` : ''}`,
    initials: initials(user?.name ?? 'U'),
    image: user?.avatarUrl,
    email: user?.email ?? '-',
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next.length < 8) return setPwMsg({ ok: false, text: 'Password baru minimal 8 karakter.' });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: 'Konfirmasi password tidak sama.' });
    setPwBusy(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: 'Password berhasil diganti.' });
    } catch (err) {
      setPwMsg({ ok: false, text: apiErrorMessage(err) });
    } finally {
      setPwBusy(false);
    }
  };

  const statA = user?.role === 'coach'
    ? { value: stats?.students ?? '-', label: 'Students' }
    : { value: stats?.completedSessions ?? '-', label: 'Sessions' };
  const statB = user?.role === 'coach'
    ? { value: user?.rating ?? '-', label: 'Rating' }
    : { value: stats?.attendance != null ? `${stats.attendance}%` : '-', label: 'Attendance' };
  const statC = user?.role === 'coach'
    ? { value: stats?.completedSessions ?? '-', label: 'Sesi Selesai' }
    : { value: user?.remainingSessions ?? '∞', label: 'Sisa Sesi' };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-emerald-900" />
            <div className="relative z-10">
              <div className="relative inline-block mt-4">
                <div className="w-32 h-32 rounded-[40px] bg-[#004d40] border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-bold mx-auto overflow-hidden">
                  {userInfo.image ? (
                    <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    userInfo.initials
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-6">{userInfo.name}</h3>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">{userInfo.role}</p>
              
              <div className="flex justify-center gap-4 mt-8">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{statA.value}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{statA.label}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 mt-1" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{statB.value}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{statB.label}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 mt-1" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{statC.value}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{statC.label}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-gray-700">{userInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-gray-700">{user?.phone ?? '-'}</p>
                </div>
              </div>
              {user?.role === 'student' && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coach</p>
                    <p className="text-sm font-bold text-gray-700">{user?.coach?.name ?? '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">Account Settings</h4>
            <button onClick={() => setPwOpen((o) => !o)} className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Security & Password</p>
                  <p className="text-xs text-gray-500 font-medium">Ganti password akun Anda</p>
                </div>
              </div>
              <ChevronRight size={20} className={`text-gray-300 group-hover:text-emerald-500 transition-all ${pwOpen ? 'rotate-90' : ''}`} />
            </button>
            {pwOpen && (
              <form onSubmit={submitPassword} className="mt-6 grid gap-3 max-w-md">
                {([
                  ['current', 'Password lama'],
                  ['next', 'Password baru (min. 8 karakter)'],
                  ['confirm', 'Ulangi password baru'],
                ] as const).map(([k, label]) => (
                  <input
                    key={k}
                    type="password"
                    required
                    placeholder={label}
                    autoComplete={k === 'current' ? 'current-password' : 'new-password'}
                    value={pw[k]}
                    onChange={(e) => setPw({ ...pw, [k]: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                ))}
                {pwMsg && <p className={`text-sm font-medium ${pwMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg.text}</p>}
                <button disabled={pwBusy} className="bg-[#004d40] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#003d33] disabled:opacity-50">
                  {pwBusy ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </form>
            )}
          </div>

          {user?.role === 'student' && (
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-900">Paket Latihan</h4>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900">{user.packageName ?? 'Belum ada paket'}</h5>
                <p className="text-xs text-emerald-700 mt-1">
                  {user.remainingSessions == null ? 'Sesi tanpa batas' : `Sisa ${user.remainingSessions} sesi`}
                  {user.program ? ` • ${user.program.level} - ${user.program.title}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
