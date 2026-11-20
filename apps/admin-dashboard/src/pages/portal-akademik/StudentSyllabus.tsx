import React from 'react';
import { BookOpen, CheckCircle2, Circle, ChevronRight, Lock, Trophy } from 'lucide-react';

import { useSyllabus } from '../../services/academyApi';
import { QueryState } from './shared';

const StudentSyllabus = () => {
  const { data, isLoading, error } = useSyllabus();
  const syllabus = (data ?? []).filter((p) => p.sublevels.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Syllabus</h1>
        <p className="text-gray-500 mt-1">Pelajari kurikulum lengkap dan jalur pembelajaran di Golfinity Hub.</p>
      </div>

      <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && syllabus.length === 0} emptyText="Silabus belum tersedia." />
      <div className="space-y-6">
        {syllabus.map((program) => (
          <div key={program.id} className="space-y-4">
            <h2 className="text-xl font-bold text-[#004d40] flex items-center gap-2">
              <BookOpen size={20} />
              {program.level} - {program.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {program.sublevels.map((sub) => (
                <div key={sub.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{sub.name}</h3>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      sub.lessons.every(s => s.status === 'locked') ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sub.lessons.every(s => s.status === 'locked') ? 'Locked' : 'Active'}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {sub.lessons.map((session) => (
                      <div 
                        key={session.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
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
                        {session.status !== 'locked' && <ChevronRight size={16} className="text-gray-400" />}
                      </div>
                    ))}
                  </div>

                  <div className={`mt-8 p-4 rounded-2xl border border-dashed flex items-center justify-between ${
                    sub.evalStatus === 'locked' ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Trophy size={18} className={sub.evalStatus === 'locked' ? 'text-gray-300' : 'text-amber-500'} />
                      <span className="text-sm font-bold">{sub.evaluation}</span>
                    </div>
                    {sub.evalStatus !== 'locked' && (
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white text-amber-700 border border-amber-200">
                        {sub.evalStatus === 'ready' ? 'Siap dievaluasi' : 'Selesaikan semua sesi'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSyllabus;
