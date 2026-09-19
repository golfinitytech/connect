import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronRight, 
  RefreshCcw, 
  Plus, 
  Flag, 
  Users, 
  Clock, 
  Trophy, 
  Search 
} from 'lucide-react';

const Rounds = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);

  const loadRealTimeData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tournaments/active');
      if (response.data) {
        setTournamentInfo(response.data);
        const groups = response.data.groups || [];
        
        const mappedRounds = groups.map((g: any, idx: number) => {
          const playersNames = g.players?.map((p: any) => p.name).join(', ') || 'No Players';
          const caddieName = g.caddie?.name && g.caddie.name !== 'Unassigned' ? g.caddie.name : (g.caddie?.number || 'Unassigned');
          
          return {
            no: idx + 1,
            id: g.id || `RND-LIVE-${idx}`,
            start: response.data.teeTime || '07:00',
            end: '-',
            group: g.code || `Group ${idx + 1}`,
            players: playersNames,
            caddie: caddieName,
            status: 'In Progress',
            isRealTime: true,
            playerCount: g.players?.length || 0
          };
        });
        
        setRounds(mappedRounds);
      } else {
        setRounds([]);
      }
    } catch (error) {
      console.warn('API error fetching tournament data, falling back to localStorage:', error);
      
      const savedData = localStorage.getItem('active_tournament');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setTournamentInfo(parsedData.info);
        const groups = parsedData.groups || [];
        
        const mappedRounds = groups.map((g: any, idx: number) => {
          const playersNames = g.players?.map((p: any) => p.name).join(', ') || 'No Players';
          const caddieName = g.caddie?.name && g.caddie.name !== 'Unassigned' ? g.caddie.name : (g.caddie?.number || 'Unassigned');
          
          return {
            no: idx + 1,
            id: g.id || `RND-LIVE-${idx}`,
            start: parsedData.info?.teeTime || '07:00',
            end: '-',
            group: g.code || `Group ${idx + 1}`,
            players: playersNames,
            caddie: caddieName,
            status: 'In Progress',
            isRealTime: true,
            playerCount: g.players?.length || 0
          };
        });
        setRounds(mappedRounds);
      } else {
        setRounds([]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRealTimeData();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active_tournament') {
        loadRealTimeData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const totalPlayers = rounds.reduce((sum, round) => sum + (round.playerCount || 0), 0);
  const activeGroups = rounds.length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800 uppercase italic tracking-tight">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Flag className="text-blue-600" size={28} />
              </div>
              {tournamentInfo?.name || 'Tournament Rounds'}
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 ml-1">
              {tournamentInfo?.date ? new Date(tournamentInfo.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {tournamentInfo?.course && ` • ${tournamentInfo.course}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadRealTimeData}
              className="bg-white hover:bg-slate-50 text-slate-600 p-3 rounded-2xl transition-all border border-slate-200 shadow-sm"
            >
              <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => navigate('/admin/rounds/create-tournament')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center gap-3"
            >
              <Plus size={20} />
              Start New Round
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Users} label="Total Players" value={totalPlayers.toString()} color="blue" />
          <StatCard icon={Flag} label="Active Groups" value={activeGroups.toString()} color="emerald" />
          <StatCard icon={Clock} label="Avg. Pace" value="-" color="amber" />
          <StatCard icon={Trophy} label="Top Score" value="-" color="rose" />
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-widest">Live</button>
                <button className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">History</button>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter groups..."
                  className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs font-bold text-slate-700 w-48"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5">Tee Time</th>
                  <th className="px-8 py-5">Group Code</th>
                  <th className="px-8 py-5">Players</th>
                  <th className="px-8 py-5">Caddie</th>
                  <th className="px-8 py-5">Position</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {rounds.map((row, i) => (
                  <tr key={i} className={`hover:bg-slate-50/50 transition-colors group ${row.isRealTime ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-8 py-6 font-black text-slate-800 italic">{row.start}</td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-100 font-black text-[10px] uppercase tracking-widest">{row.group}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-700">{row.players}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{row.playerCount} Players</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 font-black text-[10px]">{row.caddie}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-600 uppercase italic tracking-tight">{row.status === 'Completed' ? 'Finished' : 'In Progress'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        row.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100 animate-pulse'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-500/30 transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default Rounds;
