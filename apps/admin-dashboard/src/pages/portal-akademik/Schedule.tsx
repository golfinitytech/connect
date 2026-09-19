import React from 'react';
import { Calendar, Clock, MapPin, ChevronRight, Plus, Grid, List } from 'lucide-react';

const Schedule = () => {
  const upcoming = [
    { id: 1, date: '31 Jan 2026', time: '19:00', coach: 'Anang Mulyanto', topic: 'Basic Chipping', location: 'Nawasena Driving Range', type: 'Private' },
    { id: 2, date: '07 Feb 2026', time: '10:00', coach: 'Apep Benhur', topic: 'Pitching & Bunker', location: 'AFS Sulaiman Driving Range', type: 'Private' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Schedule</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming training sessions and events.</p>
        </div>
        <button className="bg-[#004d40] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-[#003d33] transition-all">
          <Plus size={18} />
          Book New Session
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 pb-px">
        <button className="px-6 py-3 border-b-2 border-[#004d40] text-[#004d40] font-bold text-sm">Upcoming</button>
        <button className="px-6 py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors">Past Sessions</button>
        <button className="px-6 py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors">Events</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcoming.map(session => (
          <div key={session.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 group hover:border-emerald-500 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center text-emerald-700">
                <span className="text-xs font-bold uppercase">{session.date.split(' ')[1]}</span>
                <span className="text-2xl font-black leading-none">{session.date.split(' ')[0]}</span>
              </div>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                {session.type} Session
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">{session.topic}</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <Clock size={18} className="text-emerald-600" />
                <span className="text-sm">{session.time} (60 mins)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <User size={18} className="text-emerald-600" />
                <span className="text-sm">{session.coach}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <MapPin size={18} className="text-emerald-600" />
                <span className="text-sm">{session.location}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all">
                Reschedule
              </button>
              <button className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        ))}

        <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-emerald-50 transition-all">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <h4 className="text-xl font-bold text-[#004d40]">Book Session</h4>
          <p className="text-sm text-emerald-600/70 mt-2 max-w-[200px]">Select a coach and time slot that works for you.</p>
        </div>
      </div>
    </div>
  );
};

import { User } from 'lucide-react';

export default Schedule;
