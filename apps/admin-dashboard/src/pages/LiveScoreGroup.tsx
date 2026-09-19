import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Flag, 
  TrendingUp, 
  ChevronRight, 
  RefreshCcw, 
  Search,
  LayoutGrid,
  ChevronDown,
  Clock,
  Activity,
  Target,
  Award,
  Monitor
} from 'lucide-react';
import LeaderboardModal from '../components/LeaderboardModal';

const LiveScoreGroup = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState<any>(null);

  const handleMonitorGroup = (group: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroupData(group);
    setIsMonitorOpen(true);
  };

  const handleMonitorAll = () => {
    // Gabungkan seluruh pemain dari semua grup dan tambahkan informasi nama grup & caddie ke setiap pemain
    const allPlayers = groups.reduce((acc: any[], group: any) => {
      const playersWithGroupName = group.players.map((p: any) => ({
        ...p,
        groupName: group.name, // Menyimpan nama grup (misal: Group 1, Group 2)
        caddieInfo: group.caddie.number // Hanya nomor caddie
      }));
      return [...acc, ...playersWithGroupName];
    }, []);
    
    setSelectedGroupData({
      name: 'ALL GROUPS',
      players: allPlayers,
      isGlobal: true // Flag untuk menandai tampilan global
    });
    setIsMonitorOpen(true);
  };

  const loadLiveScores = () => {
    setIsLoading(true);
    
    // 1. Ambil data dari database Tournament Player (active_tournament)
    const savedTournament = localStorage.getItem('active_tournament');
    const tournamentData = savedTournament ? JSON.parse(savedTournament) : null;
    const dbGroups = tournamentData?.groups || [];
    
    // 2. Ambil data skor real-time dari tablet (jika ada)
    const savedScores = localStorage.getItem('golf_players_scores');
    const activeGroupName = localStorage.getItem('golf_group_name');
    
    let processedGroups = [];

    if (dbGroups.length > 0) {
      // Gunakan data dari database Tournament Player
      processedGroups = dbGroups.map((group: any, idx: number) => {
        // Cek apakah group ini sedang aktif (punya skor real-time)
        const isGroupActive = activeGroupName === group.code;
        const groupPlayers = group.players.map((p: any) => {
          // Cari skor player (bisa dari database atau real-time storage)
          const playerScoresKey = `tournament_scores_${group.code}`;
          const pScores = localStorage.getItem(playerScoresKey);
          let scores = null;
          let approvals = null;
          let marshalEdited = null;
          if (pScores) {
            const parsed = JSON.parse(pScores);
            const found = parsed.find((ps: any) => ps.name === p.name);
            if (found) {
              scores = found.scores;
              approvals = found.approvals;
              marshalEdited = found.marshalEdited;
            }
          }
          
          const inScores = scores?.IN || Array(9).fill(0);
          const outScores = scores?.OUT || Array(9).fill(0);
          
          const inApprovals = approvals?.IN || Array(9).fill(false);
          const outApprovals = approvals?.OUT || Array(9).fill(false);
          const inMarshal = marshalEdited?.IN || Array(9).fill(false);
          const outMarshal = marshalEdited?.OUT || Array(9).fill(false);

          let total = 0;
          let holesPlayed = 0;
          let totalPar = 0;
          
          const holeDataIN = [
            { num: 1, par: 4 }, { num: 2, par: 3 }, { num: 3, par: 4 },
            { num: 4, par: 5 }, { num: 5, par: 4 }, { num: 6, par: 4 },
            { num: 7, par: 3 }, { num: 8, par: 4 }, { num: 9, par: 5 }
          ];
          const holeDataOUT = [
            { num: 10, par: 4 }, { num: 11, par: 3 }, { num: 12, par: 4 },
            { num: 13, par: 4 }, { num: 14, par: 5 }, { num: 15, par: 4 },
            { num: 16, par: 3 }, { num: 17, par: 5 }, { num: 18, par: 4 }
          ];

          inScores.forEach((s: any, i: number) => {
            if ((inApprovals[i] || inMarshal[i]) && typeof s === 'number' && s > 0) {
              total += s;
              holesPlayed++;
              totalPar += holeDataIN[i].par;
            }
          });
          outScores.forEach((s: any, i: number) => {
            if ((outApprovals[i] || outMarshal[i]) && typeof s === 'number' && s > 0) {
              total += s;
              holesPlayed++;
              totalPar += holeDataOUT[i].par;
            }
          });
          
          const relativeNum = total === 0 ? 0 : total - totalPar;
          const relativeStr = relativeNum > 0 ? `+${relativeNum}` : relativeNum === 0 ? 'E' : relativeNum.toString();

          return {
            ...p,
            total,
            relative: relativeStr,
            holesPlayed,
            scores: { IN: inScores, OUT: outScores }
          };
        });

        // Hitung rata-rata score group
        const groupTotalRelative = groupPlayers.reduce((acc: number, p: any) => {
          const rel = p.relative === 'E' ? 0 : parseInt(p.relative);
          return acc + rel;
        }, 0);
        const avgRel = Math.round(groupTotalRelative / groupPlayers.length);
        const avgScoreStr = avgRel > 0 ? `+${avgRel}` : avgRel === 0 ? 'E' : avgRel.toString();

        const currentCaddie = group.caddie || { number: (idx + 1).toString().padStart(3, '0'), name: 'Unassigned' };
        let cleanNumber = currentCaddie.number.toString();
        if (cleanNumber.startsWith('C-')) cleanNumber = cleanNumber.replace('C-', '');
        else if (cleanNumber.startsWith('C')) cleanNumber = cleanNumber.replace('C', '');

        let cleanName = currentCaddie.name;
        // Auto-lookup name from master if still Unassigned
        if (cleanName === 'Unassigned') {
          const savedCaddiesStr = localStorage.getItem('golf_caddies_master');
          if (savedCaddiesStr) {
            const master = JSON.parse(savedCaddiesStr);
            const masterCaddie = master.find((c: any) => c.name === cleanNumber);
            if (masterCaddie) {
              cleanName = masterCaddie.searchedName;
            }
          }
        }

        return {
          id: group.id,
          name: group.groupName || group.name || `Group ${idx + 1}`, // Prioritas Nama Group (misal: Group 1)
          flight: group.flightType || 'Mixed',
          teeTime: tournamentData?.info?.teeTime || '07:00',
          status: groupPlayers.every((p: any) => p.holesPlayed === 18) ? 'Finished' : (groupPlayers.some((p: any) => p.holesPlayed > 0) ? 'In Progress' : 'Waiting'),
          hole: Math.max(...groupPlayers.map((p: any) => p.holesPlayed)),
          avgScore: avgScoreStr,
          caddie: {
            ...currentCaddie,
            number: cleanNumber,
            name: cleanName
          },
          players: groupPlayers
        };
      });
    } else {
      // Fallback ke mock data jika database kosong (untuk demo tampilan)
      processedGroups = [
        {
          id: 'MOCK-01',
          name: 'Group 1',
          flight: 'Flight A',
          teeTime: '08:00',
          status: 'Waiting',
          hole: 0,
          avgScore: 'E',
          caddie: { number: '012', name: 'Andi Pratama' },
          players: [{ name: 'No Database Data', relative: 'E', total: 0, holesPlayed: 0 }]
        }
      ];
    }

    setGroups(processedGroups);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLiveScores();
    const interval = setInterval(loadLiveScores, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 lg:p-6 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section - Compact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[30px] shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Trophy size={100} />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[20px] flex items-center justify-center shadow-lg shadow-slate-200">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight italic uppercase leading-none">
                Live <span className="text-blue-600">Score</span> Center
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Group Analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={handleMonitorAll}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <Monitor size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">Monitor All</span>
            </button>
            <button 
              onClick={loadLiveScores}
              className="group p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all active:scale-90"
            >
              <RefreshCcw size={18} className={`text-slate-600 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Last Update</span>
              <span className="text-xs font-black text-slate-800 uppercase italic">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Stats - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard icon={Flag} label="Groups" value={groups.length.toString()} color="blue" />
          <SummaryCard icon={Users} label="Players" value={(groups.length * 2).toString()} color="indigo" />
          <SummaryCard icon={Target} label="Avg" value="+1.2" color="amber" />
          <SummaryCard icon={Award} label="Best" value="-3" color="emerald" />
        </div>

        {/* Main List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Live Group Standings</h2>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Over</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Under</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className={`group relative bg-white rounded-[30px] border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl ${expandedGroup === group.id ? 'ring-2 ring-blue-500/20 md:col-span-2 xl:col-span-3' : ''}`}
              >
                <div 
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-300 ${expandedGroup === group.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-black text-slate-900 italic uppercase tracking-tight truncate max-w-[120px]">{group.name}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-blue-100">
                          {group.flight.replace('Flight ', '')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <Clock size={12} className="text-slate-300" /> {group.teeTime}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                          <Flag size={12} /> H{group.hole}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          <Users size={12} /> {group.caddie.number}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Avg</span>
                      <span className={`text-sm font-black italic ${group.avgScore.startsWith('-') ? 'text-emerald-500' : group.avgScore === 'E' ? 'text-slate-800' : 'text-rose-500'}`}>
                        {group.avgScore}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleMonitorGroup(group, e)}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-90 flex items-center gap-2"
                      title="Monitor Live"
                    >
                      <Monitor size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Monitor</span>
                    </button>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${expandedGroup === group.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                      {expandedGroup === group.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Score Table - Optimized */}
                {expandedGroup === group.id && (
                  <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-slate-50/80 rounded-[24px] border border-slate-100 overflow-hidden backdrop-blur-sm">
                      <table className="w-full">
                        <thead className="bg-slate-100/50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">Player</th>
                            <th className="px-6 py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Rel</th>
                            <th className="px-6 py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Str</th>
                            <th className="px-6 py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.players.map((player: any, idx: number) => (
                            <tr key={idx} className="group/row transition-all hover:bg-white">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black italic shadow-sm ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-100'}`}>
                                    {player.name.charAt(0)}
                                  </div>
                                  <span className="font-black text-slate-900 uppercase italic tracking-tight text-sm">{player.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-xl font-black italic tracking-tighter ${
                                  player.relative.toString().startsWith('+') ? 'text-rose-500' : 
                                  player.relative === 'E' ? 'text-slate-800' : 'text-emerald-500'
                                }`}>
                                  {player.relative}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-black text-slate-800 italic">{player.total}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex flex-col items-end gap-1.5">
                                  <div className="flex gap-1">
                                    {Array(9).fill(0).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${i < player.holesPlayed / 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">H{player.holesPlayed}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monitor Modal */}
      {selectedGroupData && (
        <LeaderboardModal 
          isOpen={isMonitorOpen}
          onClose={() => setIsMonitorOpen(false)}
          tournamentName={`Group: ${selectedGroupData.name}`}
          players={selectedGroupData.players}
        />
      )}
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-500/20 transition-all duration-500">
      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">{label}</p>
        <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default LiveScoreGroup;
