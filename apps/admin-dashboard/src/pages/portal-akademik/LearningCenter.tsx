import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortalUser, useLearningContent } from '../../services/academyApi';
import type { LearningContent } from '../../services/academyApi';
import { QueryState } from './shared';
import { 
  GraduationCap, 
  PlayCircle, 
  Book, 
  FileText, 
  Search, 
  Star, 
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';

const TYPE_META: Record<LearningContent['type'], { label: string; icon: React.ReactNode }> = {
  BOOKLET: { label: 'Booklets', icon: <Book className="text-emerald-600" /> },
  VIDEO: { label: 'Videos', icon: <PlayCircle className="text-blue-600" /> },
  ARTICLE: { label: 'Articles', icon: <FileText className="text-purple-600" /> },
  COACH_TIP: { label: 'Coach Tips', icon: <Star className="text-amber-600" /> },
};

const LearningCenter = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useLearningContent();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Object.values(TYPE_META).map((m) => m.label)];
  const content = (data ?? []).map((c) => ({ ...c, typeLabel: TYPE_META[c.type].label, icon: TYPE_META[c.type].icon }));
  const q = search.trim().toLowerCase();
  const filteredContent = content.filter(
    (item) =>
      (activeCategory === 'All' || item.typeLabel === activeCategory) &&
      (!q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Section */}
      <div className="bg-[#004d40] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
            <GraduationCap size={14} />
            Golfinity Hub
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Learning Center
          </h1>
          <p className="text-emerald-100/80 text-lg leading-relaxed mb-8">
            Pusat materi tambahan dan pengetahuan tentang golf. Pelajari teknik, strategi, dan tips terbaik dari para pelatih profesional kami.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-100/50" size={20} />
            <input 
              type="text" 
              placeholder="Cari materi, video, atau artikel..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder:text-emerald-100/40 transition-all"
            />
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[10%] w-64 h-64 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute right-12 bottom-12 opacity-10">
          <GraduationCap size={240} />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 mr-2">
          <Filter size={18} className="text-gray-400 ml-2" />
          <span className="text-sm font-bold text-gray-500 pr-2 border-r border-gray-100">Filter</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat === 'All' ? 'Semua Konten' : cat}
          </button>
        ))}
      </div>

      <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && filteredContent.length === 0} emptyText="Tidak ada materi yang cocok." />
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredContent.map((item) => (
          <div 
            key={item.id}
            onClick={() => item.url && window.open(item.url, '_blank', 'noopener')}
            className="group bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors duration-500">
                <div className="transform group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
              </div>
              <span className="px-4 py-1.5 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                {item.tag}
              </span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {item.description}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {item.duration}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[40px] p-10 border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-2xl font-black text-amber-900 mb-2">Butuh Bantuan Lebih?</h2>
          <p className="text-amber-800/70">
            Jika Anda memiliki pertanyaan spesifik tentang materi atau ingin request konten baru, jangan ragu untuk menghubungi pelatih Anda melalui fitur Messages.
          </p>
        </div>
        <button onClick={() => navigate(`/portalakademik/${getPortalUser()?.role ?? 'student'}/messages`)} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-[24px] font-bold shadow-lg shadow-amber-200 transition-all flex items-center gap-3 whitespace-nowrap">
          Hubungi Pelatih <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LearningCenter;
