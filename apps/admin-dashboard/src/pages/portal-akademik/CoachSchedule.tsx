import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  Video,
  LayoutGrid,
  List,
  Filter,
  Search
} from 'lucide-react';
import { studentAccounts } from '../../data/authData';

const CoachSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 28)); // April 28, 2026
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const coachName = user?.name || 'Coach';

  // Sample data for coach's schedule
  const schedules = [
    {
      id: 1,
      studentName: 'Regi',
      time: '08:00 AM - 09:30 AM',
      type: 'On-Field Training',
      location: 'Padang Golf Sulaiman',
      level: 'Level 1',
      status: 'upcoming',
      avatar: 'R',
      date: '2026-04-28'
    },
    {
      id: 2,
      studentName: 'Hadi',
      time: '10:00 AM - 11:30 AM',
      type: 'Swing Analysis',
      location: 'Golfinity Hub - Indoor',
      level: 'Level 1',
      status: 'ongoing',
      avatar: 'H',
      date: '2026-04-28'
    },
    {
      id: 3,
      studentName: 'Fakih',
      time: '01:00 PM - 02:30 PM',
      type: 'Putting Drills',
      location: 'Palm Springs Kerawang',
      level: 'Level 2',
      status: 'upcoming',
      avatar: 'F',
      date: '2026-04-28'
    },
    {
      id: 4,
      studentName: 'Ridho',
      time: '03:30 PM - 05:00 PM',
      type: 'Strategy & Mental',
      location: 'Jatinangor National Golf',
      level: 'Level 1',
      status: 'upcoming',
      avatar: 'R',
      date: '2026-04-28'
    },
    {
      id: 5,
      studentName: 'John Doe',
      time: '09:00 AM - 10:30 AM',
      type: 'Intro to Golf',
      location: 'Golfinity Hub - Range',
      level: 'Beginner',
      status: 'completed',
      avatar: 'J',
      date: '2026-04-27'
    }
  ];

  const days = [
    { day: 'Mon', date: '27', full: '2026-04-27' },
    { day: 'Tue', date: '28', full: '2026-04-28', active: true },
    { day: 'Wed', date: '29', full: '2026-04-29' },
    { day: 'Thu', date: '30', full: '2026-04-30' },
    { day: 'Fri', date: '01', full: '2026-05-01' },
    { day: 'Sat', date: '02', full: '2026-05-02' },
    { day: 'Sun', date: '03', full: '2026-05-03' },
  ];

  const filteredSchedules = schedules.filter(s => s.date === '2026-04-28');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Jadwal Pelatihan</h1>
          <p className="text-gray-500 mt-1">Kelola sesi latihan Anda dan pantau kehadiran murid.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Search size={20} />
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
            <Plus size={18} /> Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">April 2026</h2>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <ChevronLeft size={20} />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="flex p-1 bg-gray-50 rounded-2xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {days.map((day, i) => (
            <button 
              key={i} 
              className={`flex flex-col items-center p-4 rounded-2xl transition-all group ${
                day.active 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                  : 'hover:bg-emerald-50 text-gray-500'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${day.active ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-400'}`}>
                {day.day}
              </span>
              <span className="text-lg font-black">{day.date}</span>
              {day.active && <div className="w-1.5 h-1.5 bg-white rounded-full mt-2" />}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" /> Sesi Hari Ini
          </h3>
          <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            4 Sesi Terjadwal
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredSchedules.map((session) => (
            <div key={session.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-emerald-100 transition-all group relative overflow-hidden">
              {session.status === 'ongoing' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-xl text-emerald-600 border border-gray-100">
                    {session.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{session.studentName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        {session.level}
                      </span>
                      <span className="text-gray-300 text-xs">•</span>
                      <span className="text-xs text-gray-500 font-medium">{session.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Sesi</p>
                      <p className="text-sm font-bold text-gray-800">{session.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lokasi</p>
                      <p className="text-sm font-bold text-gray-800">{session.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="lg:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      session.status === 'ongoing' ? 'bg-emerald-500 text-white animate-pulse' : 
                      session.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {session.status === 'ongoing' ? 'Sedang Berjalan' : 
                       session.status === 'upcoming' ? 'Akan Datang' : 'Selesai'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === 'ongoing' ? (
                      <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2">
                        <CheckCircle2 size={18} /> Selesaikan
                      </button>
                    ) : (
                      <button className="p-3 bg-gray-50 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors border border-gray-100">
                        <ChevronRight size={20} />
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                      <MoreVertical size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-700">
            <Users size={180} />
          </div>
          <h3 className="text-xl font-bold mb-2 relative z-10">Panggil Murid</h3>
          <p className="text-emerald-100/80 text-sm mb-6 max-w-xs relative z-10">Mulai sesi video atau kirim pengingat untuk murid yang akan datang.</p>
          <div className="flex gap-3 relative z-10">
            <button className="bg-white text-emerald-900 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-50 transition-all flex items-center gap-2">
              <Video size={18} /> Mulai Sesi Online
            </button>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sinkronisasi Kalender</h3>
          <p className="text-gray-500 text-sm mb-6">Hubungkan jadwal Golfinity Anda dengan Google Calendar atau Outlook.</p>
          <button className="w-fit px-8 py-3 bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-200">
            Hubungkan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachSchedule;
