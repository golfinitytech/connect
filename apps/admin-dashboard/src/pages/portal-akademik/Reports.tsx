import React from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Calendar, Download, ArrowUpRight, ArrowDownRight, Award, Clock, Star } from 'lucide-react';

const Reports = () => {
  const performanceStats = [
    { label: 'Pertumbuhan Murid', value: '+15%', trend: 'up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Efektivitas Pelatih', value: '94%', trend: 'up', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tingkat Kelulusan', value: '88%', trend: 'up', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Rata-rata Sesi/Bulan', value: '12.4', trend: 'down', valueColor: 'text-amber-600', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const coachPerformance = [
    { name: 'Anang Mulyanto', students: 20, rating: 5.0, completion: '98%', status: 'Excellent' },
    { name: 'Ana Suhana', students: 15, rating: 4.9, completion: '95%', status: 'Great' },
    { name: 'Uji Setiaji', students: 22, rating: 5.0, completion: '92%', status: 'Excellent' },
    { name: 'Sakim Mahara Budi', students: 18, rating: 4.9, completion: '90%', status: 'Great' },
  ];

  const recentEvaluations = [
    { student: 'Regi', coach: 'Anang Mulyanto', level: 'Level 1', score: '95/100', date: '25 Apr 2026' },
    { student: 'Hadi', coach: 'Anang Mulyanto', level: 'Level 1', score: '88/100', date: '24 Apr 2026' },
    { student: 'Fakih', coach: 'Anang Mulyanto', level: 'Level 1', score: '92/100', date: '24 Apr 2026' },
    { student: 'John Doe', coach: 'Apep Benhur', level: 'Level 2', score: '85/100', date: '23 Apr 2026' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Laporan & Analitik</h1>
          <p className="text-gray-500 mt-1 text-lg">Pantau performa akademi, pelatih, dan perkembangan murid secara mendalam.</p>
        </div>
        <button className="bg-[#004d40] hover:bg-[#003d33] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 w-fit">
          <Download size={18} /> Unduh Laporan (PDF)
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-[64px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500`} />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className={`text-2xl font-black ${stat.valueColor || 'text-gray-900'}`}>{stat.value}</p>
                <div className={`flex items-center text-[10px] font-bold mb-1 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.trend === 'up' ? '↑' : '↓'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coach Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Performa Pelatih</h3>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pelatih</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Murid</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coachPerformance.map((coach, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-gray-900">{coach.name}</p>
                    </td>
                    <td className="px-8 py-4">
                      <p className="text-sm text-gray-600">{coach.students} Murid</p>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-sm font-bold">{coach.rating}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        coach.status === 'Excellent' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {coach.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity / Evaluations */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Evaluasi Terbaru</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentEvaluations.map((evalItem, i) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md hover:border-emerald-100 border border-transparent transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{evalItem.student}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">{evalItem.level}</p>
                  </div>
                  <span className="text-emerald-600 font-black text-sm">{evalItem.score}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50">
                  <p className="text-[10px] text-gray-400 font-medium">Coach: {evalItem.coach}</p>
                  <p className="text-[10px] text-gray-400">{evalItem.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Program Distribution */}
      <div className="bg-[#004d40] rounded-[40px] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Analisis Program Latihan</h3>
            <p className="text-emerald-100/70 max-w-md">Program Level 1 (Fundamentals) memiliki tingkat retensi tertinggi bulan ini dengan 92% murid melanjutkan ke Level 2.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 bg-white/10 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Retensi</p>
              <p className="text-2xl font-black text-white">92%</p>
            </div>
            <div className="text-center px-6 py-4 bg-white/10 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Kepuasan</p>
              <p className="text-2xl font-black text-white">4.9/5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
