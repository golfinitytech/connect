import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Target,
  Trophy,
  Star
} from 'lucide-react';
import { studentAccounts } from '../../data/authData';

const CoachStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const coachName = user?.name || 'Coach';

  // Logic to determine which students belong to this coach
  const coachStudents = studentAccounts.filter(account => {
    if (coachName === 'Anang Mulyanto') {
      return ['Regi', 'Hadi', 'Fakih', 'Ridho'].includes(account.name);
    } else if (coachName === 'Apep Benhur') {
      return account.name === 'John Doe';
    } else if (coachName === 'Ana Suhana') {
      return !['Regi', 'Hadi', 'Fakih', 'Ridho', 'John Doe'].includes(account.name);
    }
    return true; // Default show all if coach not mapped
  }).map((account, index) => ({
    id: index + 1,
    name: account.name,
    level: index % 3 === 0 ? 'Level 1 - Fundamental' : (index % 3 === 1 ? 'Level 2 - Intermediate' : 'Level 3 - Advanced'),
    progress: Math.floor(Math.random() * 40) + 40, // 40-80%
    lastSession: '2 hari yang lalu',
    nextSession: 'Besok, 10:00 AM',
    status: 'Active',
    avatar: account.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
    attendance: '92%',
    handicap: Math.floor(Math.random() * 10) + 18,
    email: `${account.name.toLowerCase().replace(' ', '.')}@example.com`
  }));

  const filteredStudents = coachStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Murid Saya</h1>
          <p className="text-gray-500 mt-1">Daftar murid yang Anda bimbing dan ringkasan progres mereka.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pelatih</p>
            <p className="text-sm font-bold text-emerald-600">{coachName}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Murid', value: coachStudents.length, icon: <Users size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Rata-rata Progres', value: '68%', icon: <Target size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Kehadiran', value: '94%', icon: <CheckCircle2 size={16} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Sesi Minggu Ini', value: '12', icon: <Calendar size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-5 rounded-[24px] border border-white/50 shadow-sm relative overflow-hidden group`}>
            <div className="absolute -right-2 -top-2 text-white/10 group-hover:scale-110 transition-transform duration-500">
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 64 })}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color} relative z-10`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama murid atau level..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">
                  {student.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      {student.level.split(' - ')[0]}
                    </span>
                    <span className="text-gray-300 text-xs">•</span>
                    <span className="text-xs text-gray-500 font-medium">{student.level.split(' - ')[1]}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreVertical size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Handicap</p>
                <p className="text-sm font-bold text-gray-900">{student.handicap}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kehadiran</p>
                <p className="text-sm font-bold text-emerald-600">{student.attendance}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-bold text-blue-600">{student.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Target size={12} className="text-emerald-500" /> Progres Silabus
                  </p>
                  <p className="text-xs font-black text-emerald-600">{student.progress}%</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <Clock size={14} className="text-gray-400" />
                  Sesi Terakhir: {student.lastSession}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                  <Calendar size={14} className="text-emerald-500" />
                  Next: {student.nextSession}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors border border-gray-100">
                  <Mail size={16} />
                </button>
                <button className="p-2 bg-gray-50 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors border border-gray-100">
                  <Phone size={16} />
                </button>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:gap-3 transition-all">
                Lihat Detail Progres <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Users size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Tidak ada murid ditemukan</h3>
          <p className="text-gray-500">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}
    </div>
  );
};

export default CoachStudents;
