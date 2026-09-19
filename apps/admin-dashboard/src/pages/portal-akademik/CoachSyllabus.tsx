import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Lock, 
  Trophy, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Users,
  Target,
  BarChart2,
  Edit2
} from 'lucide-react';
import { studentAccounts } from '../../data/authData';

const CoachSyllabus = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('Regi');

  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const coachName = user?.name || 'Coach';

  // Filter students belonging to this coach
  const coachStudents = studentAccounts.filter(account => {
    if (coachName === 'Anang Mulyanto') {
      return ['Regi', 'Hadi', 'Fakih', 'Ridho'].includes(account.name);
    } else if (coachName === 'Apep Benhur') {
      return account.name === 'John Doe';
    }
    return true;
  });

  // Syllabus structure (integrated with StudentSyllabus data model)
  const syllabusData = [
    {
      level: 'Level 1 - Beginner Program',
      sublevels: [
        {
          name: 'Level 1a',
          sessions: [
            { name: 'Session 1 - Grip', status: 'completed' },
            { name: 'Session 2 - Posture', status: 'completed' },
            { name: 'Session 3 - Alignment', status: 'in-progress' },
            { name: 'Session 4 - Ball Position', status: 'pending' },
          ],
          evaluation: 'Mid Level Evaluation',
          evalStatus: 'pending'
        },
        {
          name: 'Level 2a',
          sessions: [
            { name: 'Session 5 - Grip Review', status: 'locked' },
            { name: 'Session 6 - Half Swing', status: 'locked' },
            { name: 'Session 7 - Weight Transfer', status: 'locked' },
            { name: 'Session 8 - Finish Position', status: 'locked' },
          ],
          evaluation: 'Level 1 Evaluation',
          evalStatus: 'locked'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Silabus</h1>
          <p className="text-gray-500 mt-1">Pantau dan kelola progres kurikulum setiap murid.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Users size={20} className="text-emerald-600 ml-2" />
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 pr-4 py-2"
            >
              {coachStudents.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Progres</p>
            <p className="text-2xl font-black text-gray-900">45%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sesi Selesai</p>
            <p className="text-2xl font-black text-gray-900">18 / 40</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Level Saat Ini</p>
            <p className="text-2xl font-black text-gray-900">Level 1a</p>
          </div>
        </div>
      </div>

      {/* Syllabus Content */}
      <div className="space-y-6">
        {syllabusData.map((program, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-[#004d40] flex items-center gap-2">
                <BookOpen size={20} />
                {program.level}
              </h2>
              <button className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                Edit Kurikulum <Edit2 size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {program.sublevels.map((sub, sIdx) => (
                <div key={sIdx} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full group hover:border-emerald-100 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{sub.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Kurikulum Aktif untuk {selectedStudent}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      sub.sessions.every(s => s.status === 'locked') ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sub.sessions.every(s => s.status === 'locked') ? 'Locked' : 'Active'}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {sub.sessions.map((session, sesIdx) => (
                      <div 
                        key={sesIdx} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group/item ${
                          session.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                          session.status === 'in-progress' ? 'bg-white border-emerald-500 text-emerald-900 shadow-sm' :
                          session.status === 'locked' ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-60' :
                          'bg-white border-gray-100 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {session.status === 'completed' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                           session.status === 'locked' ? <Lock size={18} className="text-gray-300" /> :
                           <Circle size={18} className={session.status === 'in-progress' ? 'text-emerald-500' : 'text-gray-300'} />}
                          <span className="text-sm font-bold">{session.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'in-progress' && (
                            <button className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-700 shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity">
                              Selesaikan
                            </button>
                          )}
                          <MoreVertical size={16} className="text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                    
                    <button className="w-full py-3 mt-2 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-bold hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                      <Plus size={16} /> Tambah Sesi Baru
                    </button>
                  </div>

                  <div className={`mt-8 p-4 rounded-2xl border border-dashed flex items-center justify-between ${
                    sub.evalStatus === 'locked' ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Trophy size={18} className={sub.evalStatus === 'locked' ? 'text-gray-300' : 'text-amber-500'} />
                      <span className="text-sm font-bold">{sub.evaluation}</span>
                    </div>
                    {sub.evalStatus !== 'locked' && (
                      <button className="bg-white text-amber-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-200">
                        Beri Evaluasi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Syllabus Management Footer */}
      <div className="bg-[#004d40] p-8 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-700">
          <BookOpen size={180} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Master Silabus Golfinity</h3>
          <p className="text-emerald-100/80 text-sm max-w-md">Perubahan pada master silabus akan memengaruhi kurikulum dasar bagi semua murid baru di level tersebut.</p>
        </div>
        <button className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg relative z-10">
          Kelola Master Kurikulum
        </button>
      </div>
    </div>
  );
};

export default CoachSyllabus;
