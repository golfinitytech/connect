import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight, Loader2, User, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { coachAccounts, adminAccounts, studentAccounts } from '../../data/authData';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'coach' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate login delay
    setTimeout(() => {
      let isValid = false;
      
      if (role === 'coach') {
        isValid = coachAccounts.some(acc => acc.username === email && acc.password === password);
      } else if (role === 'admin') {
        isValid = adminAccounts.some(acc => acc.username === email && acc.password === password);
      } else {
        isValid = studentAccounts.some(acc => acc.username === email && acc.password === password);
      }

      setLoading(false);

      if (isValid) {
        // Find user data to store
        let userData;
        if (role === 'coach') {
          userData = coachAccounts.find(acc => acc.username === email && acc.password === password);
        } else if (role === 'admin') {
          userData = adminAccounts.find(acc => acc.username === email && acc.password === password);
        } else {
          userData = studentAccounts.find(acc => acc.username === email && acc.password === password);
        }

        if (userData) {
          localStorage.setItem('portalUser', JSON.stringify({ ...userData, role }));
        }

        if (role === 'student') {
          navigate('/portalakademik/student/dashboard');
        } else if (role === 'coach') {
          navigate('/portalakademik/coach/dashboard');
        } else {
          navigate('/portalakademik/admin/dashboard');
        }
      } else {
        setError('Email atau password salah. Silakan coba lagi.');
      }
    }, 1500);
  };

  const roles = [
    { id: 'student', label: 'Student', icon: <User size={18} />, desc: 'Murid' },
    { id: 'coach', label: 'Coach', icon: <Users size={18} />, desc: 'Pelatih' },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck size={18} />, desc: 'Director' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#004d40] font-sans relative overflow-hidden">
      {/* Background Pattern/Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-white rounded-full blur-[100px]" />
      </div>

      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-20 z-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-[#004d40] font-bold text-3xl">G</span>
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Golfinity Hub</h1>
        </div>
        
        <h2 className="text-white text-6xl font-bold leading-tight mb-8">
          Monitor your <br />
          <span className="text-emerald-400">Golf Journey</span> <br />
          effortlessly.
        </h2>
        
        <p className="text-emerald-100/70 text-lg max-w-md leading-relaxed">
          Welcome to the official academic portal. Track your sessions, review your performance, and communicate with your coaches all in one place.
        </p>

        <div className="mt-12 flex gap-8">
          <div>
            <p className="text-white text-2xl font-bold">500+</p>
            <p className="text-emerald-100/50 text-sm">Active Students</p>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <p className="text-white text-2xl font-bold">50+</p>
            <p className="text-emerald-100/50 text-sm">Expert Coaches</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h3>
            <p className="text-gray-500">Please select your role and sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Login As</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id as any);
                      setError('');
                    }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                      role === r.id 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                    }`}
                  >
                    {r.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-emerald-500 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-emerald-500 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
              <label className="text-sm text-gray-600">Remember me for 30 days</label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#004d40] hover:bg-[#003d33] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account? {' '}
              <button className="font-bold text-emerald-600 hover:text-emerald-700">Contact Academy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
