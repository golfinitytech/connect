import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, BookOpen, BarChart3, Settings, Plus, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Students', value: '156', icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Total Coaches', value: '24', icon: <UserCog className="text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Active Programs', value: '8', icon: <BookOpen className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Revenue Growth', value: '+12%', icon: <BarChart3 className="text-purple-600" />, bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Utama</h1>
          <p className="text-gray-500 mt-2 text-lg">Kelola seluruh operasional hub dan kurikulum Golfinity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
            <Plus size={18} /> Add New Student
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
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

      {/* Admin Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Curriculum Management */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
            <BookOpen size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Kurikulum</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">Sesuaikan silabus, level latihan, dan materi pembelajaran untuk semua program.</p>
          <button 
            onClick={() => navigate('/portalakademik/admin/curriculum')}
            className="flex items-center justify-between w-full py-4 px-6 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 group-hover:bg-emerald-600 group-hover:text-white transition-all"
          >
            Kelola Silabus <ChevronRight size={18} />
          </button>
        </div>

        {/* Coach Management */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
            <UserCog size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Pelatih</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">Kelola data pelatih, penugasan murid, dan pantau performa pengajaran.</p>
          <button 
            onClick={() => navigate('/portalakademik/admin/coaches')}
            className="flex items-center justify-between w-full py-4 px-6 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 group-hover:bg-amber-600 group-hover:text-white transition-all"
          >
            Kelola Pelatih <ChevronRight size={18} />
          </button>
        </div>

        {/* Student Data */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Data Murid</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">Lihat riwayat latihan murid, status keanggotaan, dan progres belajar.</p>
          <button 
            onClick={() => navigate('/portalakademik/admin/students')}
            className="flex items-center justify-between w-full py-4 px-6 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-all"
          >
            Lihat Data Murid <ChevronRight size={18} />
          </button>
        </div>

        {/* Academy Data */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300 lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BarChart3 size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Statistik Hub</h3>
                <p className="text-sm text-gray-500">Pantau pertumbuhan hub, kehadiran, dan efektivitas program.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/portalakademik/admin/reports')}
              className="py-4 px-8 bg-[#004d40] text-white rounded-2xl text-sm font-bold hover:bg-[#003d33] transition-all"
            >
              Lihat Laporan Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
