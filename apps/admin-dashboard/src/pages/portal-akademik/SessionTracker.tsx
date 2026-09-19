import React from 'react';
import { History, Calendar, Clock, User, MapPin, ChevronRight, Filter, Download } from 'lucide-react';
import coachAnangImg from '../../assets/anang-mulyanto.jpeg';
import coachApepImg from '../../assets/apep-benhur.jpeg';

const SessionTracker = () => {
  const sessions = [
    { id: 3, date: '31 Jan 2026', time: '19:00', coach: 'Anang Mulyanto', image: coachAnangImg, topic: 'Basic Chipping', location: 'Nawasena Driving Range', status: 'upcoming' },
    { id: 2, date: '24 Jan 2026', time: '15:00', coach: 'Apep Benhur', image: coachApepImg, topic: 'Half Swing Introduction', location: 'Nawasena Driving Range', status: 'completed' },
    { id: 1, date: '17 Jan 2026', time: '10:00', coach: 'Anang Mulyanto', image: coachAnangImg, topic: 'Grip', location: 'AFS Sulaiman Driving Range', status: 'completed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Tracker</h1>
          <p className="text-gray-500 mt-1">Review your past and upcoming training sessions.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter size={18} />
            Filter
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#004d40] text-white">
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider first:rounded-tl-none">Session</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Date & Time</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Coach</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Topic</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider">Location</th>
                <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session, idx) => (
                <tr key={session.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      {session.id}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{session.date}</span>
                      <span className="text-xs text-gray-500 font-medium">{session.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden">
                        {session.image ? (
                          <img src={session.image} alt={session.coach} className="w-full h-full object-cover" />
                        ) : (
                          session.coach.split(' ').length > 1 ? session.coach.split(' ')[1].charAt(0) : session.coach.charAt(0)
                        )}
                      </div>
                      <span className="font-bold text-gray-700">{session.coach}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-gray-900">{session.topic}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="text-sm font-medium">{session.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1 ml-auto">
                      {session.status === 'upcoming' ? 'Reschedule' : 'Details'}
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900 rounded-[32px] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <h4 className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Total Hours</h4>
          <p className="text-4xl font-bold">36.5</p>
          <p className="text-emerald-300/60 text-sm mt-4 font-medium">+2.5 hours from last month</p>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Completion Rate</h4>
          <p className="text-4xl font-bold text-gray-900">94%</p>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[94%]" />
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Coach Feedback</h4>
          <p className="text-4xl font-bold text-gray-900">4.8</p>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-6 h-6 rounded-md ${i <= 4 ? 'bg-amber-400' : 'bg-gray-100'} flex items-center justify-center`}>
                <span className="text-white text-[10px]">★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTracker;
