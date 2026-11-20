import { usePrograms } from '../../services/academyApi';
import { QueryState } from './shared';
import { BookOpen, Star, Clock, Target, Layers, Plus, Trash2, FileText, Activity, PlusCircle } from 'lucide-react';

const ICONS = [<Target className="text-blue-600" />, <Layers className="text-emerald-600" />, <Star className="text-amber-600" />];

/** "2 Weeks" / "1 Week" → 2 / 1 */
const weeks = (d: string) => Number(/(\d+)\s*week/i.exec(d)?.[1] ?? 0);

const Curriculum = () => {
  const { data, isLoading, error } = usePrograms();
  const curriculumData = (data ?? []).map((p, i) => ({ ...p, icon: ICONS[i % ICONS.length] }));
  const totalWeeks = curriculumData.reduce((t, p) => t + p.modules.reduce((m, x) => m + weeks(x.duration), 0), 0);
  const rated = curriculumData.filter((p) => p.rating != null);
  const avgRating = rated.length ? (rated.reduce((t, p) => t + (p.rating ?? 0), 0) / rated.length).toFixed(1) : '-';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Kurikulum</h1>
          <p className="text-gray-500 mt-1 text-lg">Kelola silabus, level, dan materi pembelajaran akademi.</p>
        </div>

      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Kurikulum</p>
            <p className="text-xl font-bold text-gray-900">{curriculumData.length} Levels</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Clock className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Durasi</p>
            <p className="text-xl font-bold text-gray-900">{totalWeeks} Weeks</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Star className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Rating</p>
            <p className="text-xl font-bold text-gray-900">{avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && curriculumData.length === 0} emptyText="Belum ada kurikulum." />
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
                    {item.difficulty ?? '-'}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {item.studentCount} Murid
                  </span>
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold">
                    <Star size={12} fill="currentColor" />
                    {item.rating ?? '-'}
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
                      <div key={mod.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/50 group/item hover:border-emerald-200 transition-all">
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

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;
