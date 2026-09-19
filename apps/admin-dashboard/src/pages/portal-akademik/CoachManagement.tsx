import React, { useState } from 'react';
import { Users, Search, Filter, Plus, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin, Star, ChevronRight, X, CheckCircle2, Calendar, Clock, BarChart3 } from 'lucide-react';
import coachAnaImg from '../../assets/ana-suhana.jpeg';
import coachAnangImg from '../../assets/anang-mulyanto.jpeg';
import coachApepImg from '../../assets/apep-benhur.jpeg';
import coachAtepImg from '../../assets/atep-suwarman.jpeg';
import coachItangImg from '../../assets/itang-saepudin.jpeg';
import coachJefrizalImg from '../../assets/jefrizal-sani.jpeg';
import coachSakimImg from '../../assets/sakim-mahara-budi.jpeg';
import coachUjiImg from '../../assets/uji-setiaji.jpeg';

const CoachManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const coaches = [
    { 
      id: 1, 
      name: 'Ana Suhana', 
      specialty: 'Senior Coach • Fundamentals', 
      students: 15, 
      rating: 4.9, 
      sessionCompletion: '95%',
      email: 'ana.suhana@golfinity.id', 
      status: 'Active', 
      avatar: coachAnaImg, 
      isImage: true,
      assignedStudents: ['Ahmad', 'Budi', 'Cici']
    },
    { 
      id: 2, 
      name: 'Anang Mulyanto', 
      specialty: 'Head Coach • Advanced Swing', 
      students: 20, 
      rating: 5.0, 
      sessionCompletion: '98%',
      email: 'anang.mulyanto@golfinity.id', 
      status: 'Active', 
      avatar: coachAnangImg, 
      isImage: true,
      assignedStudents: ['Regi', 'Hadi', 'Fakih', 'Ridho']
    },
    { id: 3, name: 'Apep Benhur', specialty: 'Pro Coach • Junior Specialist', students: 12, rating: 4.8, sessionCompletion: '92%', email: 'apep.benhur@golfinity.id', status: 'Active', avatar: coachApepImg, isImage: true, assignedStudents: [] },
    { id: 4, name: 'Atep Suwarman', specialty: 'Short Game Expert', students: 10, rating: 4.7, sessionCompletion: '89%', email: 'atep.suwarman@golfinity.id', status: 'Active', avatar: coachAtepImg, isImage: true, assignedStudents: [] },
    { id: 5, name: 'Itang Saepudin', specialty: 'Mental & Strategy', students: 8, rating: 4.9, sessionCompletion: '94%', email: 'itang.saepudin@golfinity.id', status: 'Active', avatar: coachItangImg, isImage: true, assignedStudents: [] },
    { id: 6, name: 'Jefrizal Sani', specialty: 'Technical Analyst', students: 14, rating: 4.6, sessionCompletion: '87%', email: 'jefrizal.sani@golfinity.id', status: 'Active', avatar: coachJefrizalImg, isImage: true, assignedStudents: [] },
    { id: 7, name: 'Sakim Mahara Budi', specialty: 'Physical Conditioning', students: 18, rating: 4.9, sessionCompletion: '96%', email: 'sakim.budi@golfinity.id', status: 'Active', avatar: coachSakimImg, isImage: true, assignedStudents: [] },
    { id: 8, name: 'Uji Setiaji', specialty: 'Tour Professional Coach', students: 22, rating: 5.0, sessionCompletion: '99%', email: 'uji.setiaji@golfinity.id', status: 'Active', avatar: coachUjiImg, isImage: true, assignedStudents: [] },
  ];

  const handleManageStudents = (coach: any) => {
    setSelectedCoach(coach);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Pelatih</h1>
          <p className="text-gray-500 mt-1">Kontrol data, penugasan, dan performa pelatih akademi.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 w-fit">
          <Plus size={18} /> Tambah Pelatih Baru
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelatih', value: coaches.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktif', value: coaches.filter(c => c.status === 'Active').length.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Rating', value: '4.8', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Completion', value: '93%', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama pelatih atau spesialisasi..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Coach List Table/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {coaches.map((coach) => (
          <div key={coach.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl overflow-hidden">
                  {coach.isImage ? (
                    <img src={coach.avatar} alt={coach.name} className="w-full h-full object-cover" />
                  ) : (
                    coach.avatar
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{coach.name}</h3>
                  <p className="text-sm text-emerald-600 font-medium">{coach.specialty}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                coach.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {coach.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Murid</p>
                <p className="text-lg font-bold text-gray-900">{coach.assignedStudents.length}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-lg font-bold text-gray-900">{coach.rating}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Completion</p>
                <p className="text-lg font-bold text-emerald-600">{coach.sessionCompletion}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full py-3 bg-white border border-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Calendar size={14} className="text-emerald-600" /> Atur Jadwal Pelatih
              </button>
              <button className="w-full py-3 bg-white border border-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Clock size={14} className="text-blue-600" /> Assign Sesi Pelatih
              </button>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
              <button 
                onClick={() => handleManageStudents(coach)}
                className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                <Users size={14} /> Kelola Murid
              </button>
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                <Edit2 size={16} />
              </button>
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Students Modal */}
      {isModalOpen && selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kelola Murid</h2>
                  <p className="text-sm text-gray-500">Pelatih: {selectedCoach.name}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedCoach.assignedStudents.length > 0 ? (
                  selectedCoach.assignedStudents.map((student: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-emerald-50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 shadow-sm">
                          {student[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{student}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Student • Active</p>
                        </div>
                      </div>
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Belum ada murid yang ditugaskan.</p>
                  </div>
                )}
              </div>

              <button 
                className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                onClick={() => setIsModalOpen(false)}
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachManagement;
