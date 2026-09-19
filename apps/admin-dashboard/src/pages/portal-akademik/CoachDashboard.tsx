import React, { useState } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  FileText, 
  PlayCircle, 
  BarChart3, 
  CalendarRange,
  MoreVertical,
  CheckCircle2,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { studentAccounts } from '../../data/authData';

const CoachDashboard = () => {
  const [selectedTab, setSelectedTab] = useState<'today' | 'upcoming'>('today');
  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const coachName = user?.name || 'Coach';
  const coachInitials = user?.name ? getInitials(user.name) : 'C';
  const coachImage = user?.image;

  const stats = [
    { label: 'Daftar Murid', value: '12', icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Evaluasi Pending', value: '5', icon: <ClipboardCheck className="text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Sesi Selesai', value: '48', icon: <CheckCircle2 className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Jadwal Hari Ini', value: '4', icon: <Clock className="text-purple-600" />, bg: 'bg-purple-50' },
  ];

  const todaySchedule = [
    { student: 'Regi', time: '08:00 AM', type: 'On-Field', location: 'Sulaiman', status: 'ongoing' },
    { student: 'Hadi', time: '10:00 AM', type: 'Swing Analysis', location: 'Indoor Hub', status: 'upcoming' },
    { student: 'Fakih', time: '01:00 PM', type: 'Putting', location: 'Palm Springs', status: 'upcoming' },
    { student: 'Ridho', time: '03:30 PM', type: 'Strategy', location: 'Jatinangor', status: 'upcoming' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Utama</h1>
          <p className="text-gray-500 mt-2 text-lg">Halo, Coach {coachName.split(' ')[0]}. Berikut ringkasan aktivitas Anda hari ini.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-[#004d40] flex items-center justify-center text-white font-bold overflow-hidden">
            {coachImage ? (
              <img src={coachImage} alt={coachName} className="w-full h-full object-cover" />
            ) : (
              coachInitials
            )}
          </div>
          <div className="pr-4">
            <p className="text-sm font-bold text-gray-900 leading-none">{coachName}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Lead Coach • Senior</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Schedule & Guide */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Schedule Section */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex p-1 bg-gray-50 rounded-xl">
                  <button 
                    onClick={() => setSelectedTab('today')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === 'today' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Jadwal Hari Ini
                  </button>
                  <button 
                    onClick={() => setSelectedTab('upcoming')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === 'upcoming' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Akan Datang
                  </button>
                </div>
              </div>
              <button className="text-emerald-600 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                Lihat Kalender <ChevronRight size={16} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              {todaySchedule.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-sm ${item.status === 'ongoing' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                      <span className="text-[10px] opacity-70 uppercase tracking-tighter">Time</span>
                      {item.time.split(' ')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.student}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <MapPin size={10} /> {item.location}
                        </span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.status === 'ongoing' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">LIVE</span>
                    )}
                    <button className="p-2 hover:bg-white rounded-xl text-gray-300 hover:text-emerald-600 transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guide & Reports Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[40px] text-white shadow-lg relative overflow-hidden group cursor-pointer">
              <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700">
                <PlayCircle size={140} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <PlayCircle size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Training Session Guide</h3>
                <p className="text-emerald-50/70 text-sm mb-6">Panduan materi latihan untuk sesi hari ini.</p>
                <button className="bg-white text-emerald-900 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-50 transition-all">
                  BUKA PANDUAN
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all cursor-pointer">
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Session Report</h3>
                <p className="text-gray-500 text-sm">Buat laporan harian hasil latihan murid.</p>
              </div>
              <button className="w-full mt-8 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                BUAT LAPORAN
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Evaluations & Stats & Availability */}
        <div className="space-y-8">
          
          {/* Pending Evaluations */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck size={20} className="text-amber-600" />
                Evaluasi Harus Diisi
              </h3>
              <span className="w-6 h-6 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center justify-center">5</span>
            </div>
            <div className="space-y-4">
              {studentAccounts.slice(0, 3).map((student, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-amber-50/50 transition-colors group cursor-pointer border border-transparent hover:border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-gray-400 group-hover:text-amber-600 text-xs shadow-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{student.name}</p>
                      <p className="text-[10px] text-gray-500">Selesai {['1 jam', '3 jam', 'Kemarin'][i]} lalu</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-600 transition-all" />
                </div>
              ))}
              <button className="w-full py-3 text-xs font-bold text-amber-600 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors">
                Lihat Semua Antrean
              </button>
            </div>
          </div>

          {/* Student Statistics Summary */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Statistik Murid
            </h3>
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Pencapaian Silabus</p>
                  <p className="text-xs font-black text-blue-700">Level 2 (65%)</p>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-rata Skor</p>
                  <p className="text-lg font-black text-gray-900">8.4</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kehadiran</p>
                  <p className="text-lg font-black text-gray-900">92%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability / Schedule Management */}
          <div className="bg-amber-500 p-8 rounded-[32px] text-white shadow-lg shadow-amber-100 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-4 -bottom-4 text-white/20 group-hover:scale-110 transition-transform duration-500">
              <CalendarRange size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-white" />
                <h3 className="text-lg font-black">Pengisian Jadwal</h3>
              </div>
              <p className="text-amber-50 text-xs mb-6 leading-relaxed">Informasikan jadwal ketersediaan atau blokir waktu saat Anda berhalangan hadir.</p>
              <button className="bg-white text-amber-600 px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-amber-50 transition-all flex items-center gap-2">
                ISI KETERSEDIAAN <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
