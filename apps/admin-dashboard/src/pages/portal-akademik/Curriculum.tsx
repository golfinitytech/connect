import { useState } from 'react';
import { BookOpen, Star, Clock, Target, Layers, Plus, Trash2, FileText, Activity, PlusCircle } from 'lucide-react';

const Curriculum = () => {
  const curriculumData = [
    {
      id: 1,
      level: 'Level 1',
      title: 'Fundamentals of Golf',
      description: 'Pengenalan dasar teknik golf, grip, posture, dan pengenalan peralatan.',
      modules: [
        { 
          name: 'Grip & Setup', 
          duration: '2 Weeks', 
          status: 'Active',
          drills: ['Static Grip Practice', 'Posture Alignment']
        },
        { 
          name: 'Basic Swing Motion', 
          duration: '3 Weeks', 
          status: 'Active',
          drills: ['Half Swing Drill', 'Tempo Control']
        },
        { 
          name: 'Introduction to Putter', 
          duration: '1 Week', 
          status: 'Active',
          drills: ['Pendulum Motion', 'Short Putts']
        }
      ],
      difficulty: 'Beginner',
      rating: 4.9,
      icon: <Target className="text-blue-600" />
    },
    {
      id: 2,
      level: 'Level 2',
      title: 'Advanced Swing Mechanics',
      description: 'Pendalaman teknik swing, kontrol jarak, dan pengenalan iron shot.',
      modules: [
        { 
          name: 'Full Swing Consistency', 
          duration: '4 Weeks', 
          status: 'Active',
          drills: ['Impact Position', 'Weight Transfer']
        },
        { 
          name: 'Iron Play Fundamentals', 
          duration: '3 Weeks', 
          status: 'Active',
          drills: ['Divot Control', 'Ball Striking']
        },
        { 
          name: 'Distance Control', 
          duration: '2 Weeks', 
          status: 'Draft',
          drills: ['Club Selection', 'Trajectory Control']
        }
      ],
      difficulty: 'Intermediate',
      rating: 4.8,
      icon: <Layers className="text-emerald-600" />
    },
    {
      id: 3,
      level: 'Level 3',
      title: 'Short Game & Course Management',
      description: 'Fokus pada chipping, pitching, bunker shots, dan strategi di lapangan.',
      modules: [
        { 
          name: 'Chipping & Pitching', 
          duration: '3 Weeks', 
          status: 'Active',
          drills: ['Landing Spot Drill', 'Spin Control']
        },
        { 
          name: 'Bunker Play', 
          duration: '2 Weeks', 
          status: 'Active',
          drills: ['Splash Shot', 'Buried Lie']
        },
        { 
          name: 'Course Strategy', 
          duration: '3 Weeks', 
          status: 'Active',
          drills: ['Risk Reward Analysis', 'Wind Reading']
        }
      ],
      difficulty: 'Advanced',
      rating: 5.0,
      icon: <Star className="text-amber-600" />
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Kurikulum</h1>
          <p className="text-gray-500 mt-1 text-lg">Kelola silabus, level, dan materi pembelajaran akademi.</p>
        </div>
        <button className="bg-[#004d40] hover:bg-[#003d33] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 w-fit">
          <Plus size={18} /> Tambah Kurikulum Baru
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Kurikulum</p>
            <p className="text-xl font-bold text-gray-900">3 Levels</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Clock className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Durasi</p>
            <p className="text-xl font-bold text-gray-900">24 Weeks</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Star className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Rating</p>
            <p className="text-xl font-bold text-gray-900">4.9 / 5.0</p>
          </div>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="space-y-6">
        {curriculumData.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{item.level}</span>
                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">{item.title}</h3>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {item.difficulty}
                  </span>
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold">
                    <Star size={12} fill="currentColor" />
                    {item.rating}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-gray-50 rounded-[32px] p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                    Modul Pembelajaran
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{item.modules.length} Modul</span>
                  </h4>
                  <div className="space-y-4">
                    {item.modules.map((mod, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/50 group/item hover:border-emerald-200 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{mod.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{mod.duration}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            mod.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {mod.status}
                          </span>
                        </div>
                        
                        {/* Drills Section */}
                        <div className="pl-11 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Activity size={10} /> Drills ({mod.drills?.length || 0})
                            </p>
                            <button className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                              <Plus size={10} /> Tambah Drill
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {mod.drills?.map((drill, dIdx) => (
                              <span key={dIdx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-medium border border-blue-100/50">
                                {drill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-56 flex lg:flex-col gap-3 justify-end lg:justify-start">
                <button className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-100">
                  <FileText size={14} /> Update Silabus
                </button>
                <button className="w-full py-3.5 bg-white border border-gray-100 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                  <PlusCircle size={14} className="text-blue-600" /> Tambah Modul
                </button>
                <button className="w-full py-3.5 bg-white border border-gray-100 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                  <Activity size={14} className="text-amber-600" /> Tambah Drill
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;
