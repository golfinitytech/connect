import React from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';
import { fmtDate, initials, useEvaluations, useStats } from '../../services/academyApi';
import type { StudentStats } from '../../services/academyApi';
import { QueryState } from './shared';

const PerformanceEvaluation = () => {
  const { data: st } = useStats<StudentStats>();
  const { data: evals, isLoading, error } = useEvaluations();
  const done = (evals ?? []).filter((e) => e.status === 'COMPLETED');
  const passed = done.filter((e) => (e.score ?? 0) >= 70).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance & Evaluation</h1>
        <p className="text-gray-500 mt-1">Track your progress and coach evaluations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
          <p className="text-3xl font-bold text-[#004d40] mt-2">{st ? `${st.syllabusProgress}%` : '…'}</p>
          <p className="text-xs text-gray-500 mt-1">Sesi silabus yang sudah selesai</p>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Skill Level</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">{st?.currentSublevel ?? '-'}</p>
          <p className="text-xs text-gray-500 mt-1">{st?.lastScore != null ? `Nilai terakhir: ${st.lastScore}` : 'Belum ada nilai'}</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
            <Target size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Evaluasi Lulus</h3>
          <p className="text-3xl font-bold text-purple-900 mt-2">{passed} / {done.length}</p>
          <p className="text-xs text-gray-500 mt-1">Nilai minimal 70</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Coach Evaluation</h3>
        <QueryState isLoading={isLoading} error={error} isEmpty={!isLoading && !error && done.length === 0} emptyText="Belum ada evaluasi dari coach." />
        <div className="space-y-6">
          {done.map((ev) => {
            const stars = Math.round((ev.score ?? 0) / 20);
            return (
              <div key={ev.id} className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#004d40] flex items-center justify-center text-white font-bold shrink-0">
                  {initials(ev.coach.name)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900">Coach {ev.coach.name}</h4>
                      <p className="text-xs text-gray-500">{fmtDate(ev.evaluatedAt ?? ev.createdAt)} • {ev.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{ev.score}/100</span>
                      <div className="flex gap-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={16} fill={s <= stars ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {ev.notes && <p className="text-sm text-gray-700 mt-3 leading-relaxed">"{ev.notes}"</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Star = ({ size, fill, className }: { size: number, fill: string, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={fill} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default PerformanceEvaluation;
