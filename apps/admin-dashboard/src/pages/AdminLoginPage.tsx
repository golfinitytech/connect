import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate login
    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      
      const adminUsers = [
        { email: 'admin@golfinitiy.id', password: '1234', location: 'Global Admin', locationId: 'global' },
        { email: 'admin@golfinity.id', password: 'Admin12345!', location: 'Global Admin', locationId: 'global' },
        { email: 'karawang@golfinity.id', password: '1234', location: 'Palm Springs Karawang', locationId: 'karawang' },
        { email: 'sulaiman@golfinity.id', password: '1234', location: 'Padang Golf Sulaiman', locationId: 'sulaiman' },
        { email: 'jatinangor@golfinity.id', password: '1234', location: 'Jatinangor National Golf', locationId: 'jatinangor' }
      ];

      const user = adminUsers.find(u => u.email === trimmedEmail && u.password === trimmedPassword);

      if (user) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminLocation', user.location);
        localStorage.setItem('adminLocationId', user.locationId);
        navigate('/admin');
      } else {
        setError('Email atau password salah. Silakan coba lagi.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0f172a] font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center p-6">
        {/* Back to Home */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Menu Utama</span>
        </button>

        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/20 mb-6">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic mb-2">
              GOLFINITY<span className="text-blue-500">ADMIN</span>
            </h1>
            <p className="text-slate-400 font-medium">Panel Manajemen Administrator</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium animate-shake">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-black uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@golfinitiy.id"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-black uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Log In Admin</span>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-10 text-slate-500 text-xs font-bold tracking-widest uppercase">
            &copy; 2026 GOLFINITYSCORE. SECURE ACCESS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
