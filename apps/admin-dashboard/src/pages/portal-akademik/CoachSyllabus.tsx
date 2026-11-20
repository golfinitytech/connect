import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, Circle, Lock, Trophy, Users, Target } from 'lucide-react';
import { apiErrorMessage, useStudents, useSyllabus, useUpdateProgress } from '../../services/academyApi';
import type { LessonStatus } from '../../services/academyApi';
import { QueryState } from './shared';

const STATUS_OPTIONS: { value: LessonStatus; api: 'LOCKED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; label: string }[] = [
  { value: 'locked', api: 'LOCKED', label: 'Terkunci' },
  { value: 'pending', api: 'PENDING', label: 'Belum mulai' },
  { value: 'in-progress', api: 'IN_PROGRESS', label: 'Berjalan' },
  { value: 'completed', api: 'COMPLETED', label: 'Selesai' },
];

const CoachSyllabus = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data: students, isLoading: studentsLoading, error: studentsError } = useStudents();

  const selectedId = params.get('student') ?? '';
  useEffect(() => {
    if (!selectedId && students?.length) setParams({ student: students[0].id }, { replace: true });
  }, [selectedId, students, setParams]);

  const selected = students?.find((s) => s.id === selectedId);
  const { data: syllabus, isLoading, error } = useSyllabus(selectedId || undefined, !!selectedId);
  const update = useUpdateProgress();

  const programs = (syllabus ?? []).filter((p) => p.sublevels.length > 0);
  const lessons = programs.flatMap((p) => p.sublevels.flatMap((s) => s.lessons));
  const done = lessons.filter((l) => l.status === 'completed').length;
  const currentSub = programs
    .flatMap((p) => p.sublevels)
    .find((s) => s.lessons.some((l) => l.status === 'in-progress' || l.status === 'pending'));

  const setStatus = (lessonId: string, value: LessonStatus) => {
    const api = STATUS_OPTIONS.find((o) => o.value === value)!.api;
    update.mutate({ studentId: selectedId, lessonId, status: api }, { onError: (e) => window.alert(apiErrorMessage(e)) });
  };

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
              value={selectedId}
              onChange={(e) => setParams({ student: e.target.value })}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 pr-4 py-2"
            >
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <QueryState
        isLoading={studentsLoading}
        error={studentsError}
        isEmpty={!studentsLoading && !studentsError && (students ?? []).length === 0}
        emptyText="Anda belum memiliki murid."
      />

      {selected && (
        <>
          {/* Student Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Progres</p>
                <p className="text-2xl font-black text-gray-900">{lessons.length ? Math.round((done / lessons.length) * 100) : 0}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sesi Selesai</p>
                <p className="text-2xl font-black text-gray-900">{done} / {lessons.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Level Saat Ini</p>
                <p className="text-2xl font-black text-gray-900">{currentSub?.name ?? (lessons.length && done === lessons.length ? 'Lulus' : '-')}</p>
              </div>
            </div>
          </div>

          <QueryState isLoading={isLoading} error={error} />

          {/* Syllabus Content */}
          <div className="space-y-6">
            {programs.map((program) => (
              <div key={program.id} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-bold text-[#004d40] flex items-center gap-2">
                    <BookOpen size={20} />
                    {program.level} - {program.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {program.sublevels.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full group hover:border-emerald-100 transition-all">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{sub.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">Kurikulum untuk {selected.name}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          sub.lessons.every((s) => s.status === 'locked') ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {sub.lessons.every((s) => s.status === 'locked') ? 'Locked' : 'Active'}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        {sub.lessons.map((session) => (
                          <div
                            key={session.id}
                            className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                              session.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                              session.status === 'in-progress' ? 'bg-white border-emerald-500 text-emerald-900 shadow-sm' :
                              session.status === 'locked' ? 'bg-gray-50 border-gray-100 text-gray-400' :
                              'bg-white border-gray-100 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {session.status === 'completed' ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> :
                               session.status === 'locked' ? <Lock size={18} className="text-gray-300 shrink-0" /> :
                               <Circle size={18} className={`shrink-0 ${session.status === 'in-progress' ? 'text-emerald-500' : 'text-gray-300'}`} />}
                              <span className="text-sm font-bold truncate">{session.name}</span>
                            </div>
                            <select
                              aria-label={`Status ${session.name}`}
                              value={session.status}
                              disabled={update.isPending}
                              onChange={(e) => setStatus(session.id, e.target.value as LessonStatus)}
                              className="text-xs font-bold bg-white/80 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                            >
                              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
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
                          <button
                            onClick={() => navigate('/portalakademik/coach/evaluations')}
                            className="bg-white text-amber-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-200"
                          >
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
        </>
      )}
    </div>
  );
};

export default CoachSyllabus;
