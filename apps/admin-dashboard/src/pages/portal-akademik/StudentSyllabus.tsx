import React from 'react';
import { BookOpen, CheckCircle2, Circle, ChevronRight, Lock, Trophy } from 'lucide-react';

const StudentSyllabus = () => {
  const syllabus = [
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Syllabus</h1>
        <p className="text-gray-500 mt-1">Pelajari kurikulum lengkap dan jalur pembelajaran di Golfinity Hub.</p>
      </div>

      <div className="space-y-6">
        {syllabus.map((program, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-xl font-bold text-[#004d40] flex items-center gap-2">
              <BookOpen size={20} />
              {program.level}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {program.sublevels.map((sub, sIdx) => (
                <div key={sIdx} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{sub.name}</h3>
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
                      <button className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-all shadow-sm">
                        Start
                      </button>
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
