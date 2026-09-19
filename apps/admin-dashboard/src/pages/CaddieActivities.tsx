import React, { useState, useEffect } from 'react';
import { Clock, Download, FileText, User } from 'lucide-react';
import api from '../services/api';
import MiniScorecardModal from '../components/MiniScorecardModal';

const CaddieActivities = () => {
  const currentAdminLocationId = localStorage.getItem('adminLocationId') || 'karawang';
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch real data from backend
        // We'll use the tournament rounds endpoint for now, but filter it for caddie activities
        // In a real scenario, you'd have a specific endpoint like /caddie-activities
        const res = await api.get(`/tournaments/rounds`);
        
        if (Array.isArray(res.data)) {
          // Map backend data to our frontend format
          const formatted = res.data
            .filter((r: any) => r.locationId === currentAdminLocationId && r.tournamentId === 'CADDIE_MODE')
            .map((r: any) => {
              // Calculate completed holes
              let maxHole = 0;
              const players = Array.isArray(r.players) ? r.players : [];
              const playerNames = players.map((p: any) => p.name || 'Unknown');
              
              players.forEach((p: any) => {
                if (p.scores) {
                  const inScores = p.scores.IN || [];
                  const outScores = p.scores.OUT || [];
                  const filledIn = inScores.filter((s: number) => s > 0).length;
                  const filledOut = outScores.filter((s: number) => s > 0).length;
                  maxHole = Math.max(maxHole, filledIn + filledOut);
                }
              });

              // Determine status
              const status = r.isCompleted || maxHole === 18 ? 'Completed' : 'In Progress';

              return {
                id: r.id || Math.random().toString(),
                date: new Date(r.startTime || Date.now()).toISOString().slice(0, 16).replace('T', ' '),
                caddieCode: r.caddieCode || 'Unknown',
                players: playerNames,
                holesCompleted: maxHole,
                status: status,
                scorecardId: r.groupCode || 'N/A',
                rawPlayersData: players // Pass raw data for the modal
              };
            });
            
          // Sort by date descending
          formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setActivities(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch caddie activities:', err);
      }
    };

    fetchActivities();
    // Auto refresh every 10 seconds to show real-time updates
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, [currentAdminLocationId]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto text-sm">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40"></div>
        <h2 className="text-2xl text-slate-800 font-black tracking-tight">Recent Caddie Mode Activities</h2>
      </div>

      <div className="bg-white p-5 rounded-2xl flex flex-wrap items-center justify-between shadow-sm border border-slate-100 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          <span className="text-slate-400 font-black">~</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          <button className="bg-indigo-600 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all active:translate-y-0">
            Search
          </button>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-slate-800/20 hover:bg-slate-700 hover:-translate-y-0.5 transition-all active:translate-y-0">
          <Download size={18} />
          Download Spreadsheet
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
                <th className="py-4 px-6 font-bold tracking-wide rounded-tl-xl">Time</th>
                <th className="py-4 px-6 font-bold tracking-wide">Caddie</th>
                <th className="py-4 px-6 font-bold tracking-wide">Players</th>
                <th className="py-4 px-6 font-bold tracking-wide">Holes</th>
                <th className="py-4 px-6 font-bold tracking-wide">Status</th>
                <th className="py-4 px-6 font-bold tracking-wide rounded-tr-xl">Scorecard</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 divide-y divide-slate-50">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={16} />
                      {activity.date}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-block bg-white text-slate-800 border border-slate-200 px-4 py-1.5 rounded-full font-black shadow-sm">
                      {activity.caddieCode}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {activity.players.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                          <User size={12} /> {p}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-indigo-600">
                    {activity.holesCompleted} / 18
                  </td>
                  <td className="py-4 px-6">
                    {activity.status === 'Completed' ? (
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full font-bold text-xs">
                        Completed
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full font-bold text-xs animate-pulse">
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => {
                        setSelectedActivityId(activity.id);
                        setIsScorecardOpen(true);
                      }}
                      className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 font-bold text-xs transition-colors"
                    >
                      <FileText size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <MiniScorecardModal 
        isOpen={isScorecardOpen}
        onClose={() => {
          setIsScorecardOpen(false);
          setSelectedActivityId(null);
        }}
        activity={activities.find(a => a.id === selectedActivityId)}
      />
    </div>
  );
};

export default CaddieActivities;