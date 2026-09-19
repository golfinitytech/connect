import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  Calendar, 
  User, 
  BookOpen, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Plus
} from 'lucide-react';
import { studentAccounts } from '../../data/authData';

const CoachEvaluations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const coachName = user?.name || 'Coach';

  // Sample data for evaluations
  const evaluations = [
    {
      id: 1,
      studentName: 'Regi',
      level: 'Level 1 - Fundamental',
      sessionDate: '28 Apr 2026',
      sessionTime: '10:00 AM',
      topic: 'Grip & Stance Improvement',
      status: 'pending',
      avatar: 'R'
    },
    {
      id: 2,
      studentName: 'Hadi',
      level: 'Level 1 - Fundamental',
      sessionDate: '28 Apr 2026',
      sessionTime: '01:30 PM',
      topic: 'Basic Swing Motion',
      status: 'pending',
      avatar: 'H'
    },
    {
      id: 3,
      studentName: 'Fakih',
      level: 'Level 2 - Intermediate',
      sessionDate: '27 Apr 2026',
      sessionTime: '04:00 PM',
      topic: 'Iron Consistency',
      status: 'completed',
      score: 8.5,
      avatar: 'F'
    },
    {
      id: 4,
      studentName: 'Ridho',
      level: 'Level 1 - Fundamental',
      sessionDate: '27 Apr 2026',
      sessionTime: '09:00 AM',
      topic: 'Putting Alignment',
      status: 'completed',
      score: 9.0,
      avatar: 'R'
    }
  ];

  const filteredEvaluations = evaluations.filter(ev => 
    ev.status === activeTab &&
    (ev.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     ev.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Evaluasi Murid</h1>
          <p className="text-gray-500 mt-1">Berikan penilaian dan masukan untuk sesi latihan yang telah selesai.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs font-bold text-gray-600">{evaluations.filter(e => e.status === 'pending').length} Perlu Evaluasi</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Menunggu Penilaian</p>
            <p className="text-2xl font-black text-gray-900">{evaluations.filter(e => e.status === 'pending').length} Sesi</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telah Dievaluasi</p>
            <p className="text-2xl font-black text-gray-900">{evaluations.filter(e => e.status === 'completed').length} Sesi</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-rata Skor</p>
            <p className="text-2xl font-black text-gray-900">8.75</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex p-1 bg-gray-50 rounded-2xl w-full md:w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'pending' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Belum Dinilai
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Selesai
          </button>
        </div>
        
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari murid atau topik sesi..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Evaluation List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvaluations.map((ev) => (
          <div key={ev.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-emerald-100 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                  {ev.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{ev.studentName}</h3>
                  <p className="text-xs text-gray-500 font-medium">{ev.level}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Topik Sesi</p>
                  <p className="text-sm font-bold text-gray-800">{ev.topic}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Waktu Sesi</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Calendar size={14} className="text-gray-400" />
                    {ev.sessionDate}
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ev.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {ev.status === 'pending' ? 'Perlu Dinilai' : 'Selesai'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {ev.status === 'pending' ? (
                  <button className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} /> Beri Nilai
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skor</p>
                      <div className="flex items-center gap-1 text-emerald-600 font-black">
                        <Star size={14} fill="currentColor" /> {ev.score}/10
                      </div>
                    </div>
                    <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (activeTab === 'pending') && (
        <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Semua Selesai!</h3>
          <p className="text-gray-500">Tidak ada sesi yang menunggu evaluasi saat ini.</p>
        </div>
      )}
    </div>
  );
};

export default CoachEvaluations;
