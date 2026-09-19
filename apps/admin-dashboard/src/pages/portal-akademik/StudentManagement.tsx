import React, { useState } from 'react';
import { Users, Search, Filter, Plus, Edit2, Trash2, BookOpen, Calendar, ChevronRight, BarChart2 } from 'lucide-react';
import { studentAccounts } from '../../data/authData';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mapping students to include coach information based on previous context
  const students = studentAccounts.map((account, index) => {
    let coachName = 'Ana Suhana'; // Default coach
    if (['Regi', 'Hadi', 'Fakih', 'Ridho'].includes(account.name)) {
      coachName = 'Anang Mulyanto';
    } else if (account.name === 'John Doe') {
      coachName = 'Apep Benhur';
    }

    return {
      id: index + 1,
      name: account.name,
      level: index % 2 === 0 ? 'Level 1 - Fundamental' : 'Level 2 - Advanced',
      coach: coachName,
      joinDate: 'Jan 2024',
      status: 'Active',
      avatar: account.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      package: index % 3 === 0 ? '12 Sesi' : (index % 3 === 1 ? '24 Sesi' : 'Unlimited'),
      remainingSessions: index % 3 === 0 ? 5 : (index % 3 === 1 ? 18 : '∞'),
      lastPractice: index % 2 === 0 ? '2 hari yang lalu' : 'Minggu lalu'
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Murid</h1>
          <p className="text-gray-500 mt-1">Pantau progres, pendaftaran, dan status keanggotaan murid.</p>
        </div>
        <button className="bg-[#004d40] hover:bg-[#003d33] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 w-fit">
          <Plus size={18} /> Daftarkan Murid Baru
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Murid', value: students.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktif', value: students.filter(s => s.status === 'Active').length.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Level 1', value: students.filter(s => s.level.includes('Level 1')).length.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Lulus Bulan Ini', value: '2', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama murid, coach, atau level..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
            <Filter size={18} /> Filter Level
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Murid</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level Murid</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paket Sesi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Riwayat Latihan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pelatih</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students
                .filter(s => 
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  s.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.package.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-[10px] text-gray-500">Joined {student.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-gray-700">{student.level}</p>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[65%]" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900">{student.package}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Sisa: {student.remainingSessions} Sesi</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-sm text-gray-600 font-medium">{student.lastPractice}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 font-medium">{student.coach}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Edit Data">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Lihat Progres">
                        <BarChart2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-500 font-medium">Menampilkan 4 dari 156 murid</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-emerald-600 hover:border-emerald-200 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
