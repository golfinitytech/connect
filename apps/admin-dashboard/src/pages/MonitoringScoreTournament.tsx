import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Users, Clock, Maximize, Crown } from 'lucide-react';

const MonitoringScoreTournament = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterMode, setFilterMode] = useState<'Group' | 'Flight' | 'Overall' | 'FlightA' | 'FlightB' | 'FlightC'>('Overall');
  const [allPlayersData, setAllPlayersData] = useState<any[]>([]);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | number | null>(null);
  const [tournamentName, setTournamentName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'detailed_par'>('summary');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Fixed for admin view since they are monitoring everything
  const currentGroupCode = undefined;
  const currentFlight = undefined;

  const holeData = {
    IN: [
      { num: 1, par: 4 }, { num: 2, par: 3 }, { num: 3, par: 4 },
      { num: 4, par: 5 }, { num: 5, par: 4 }, { num: 6, par: 4 },
      { num: 7, par: 3 }, { num: 8, par: 4 }, { num: 9, par: 5 },
    ],
    OUT: [
      { num: 10, par: 4 }, { num: 11, par: 3 }, { num: 12, par: 4 },
      { num: 13, par: 4 }, { num: 14, par: 5 }, { num: 15, par: 4 },
      { num: 16, par: 3 }, { num: 17, par: 5 }, { num: 18, par: 4 },
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // @ts-ignore
        const { default: api } = await import('../services/api');
        const response = await api.get('/tournaments/active');
        if (response.data && response.data.groups) {
          const tournament = response.data;
          localStorage.setItem('active_tournament', JSON.stringify(tournament));
          
          // Sync each group's players to local tournament_scores_* so the leaderboard sees them
          const dbGroups = tournament.groups || [];
          dbGroups.forEach((group: any) => {
            if (group.players && group.players.length > 0) {
              localStorage.setItem(`tournament_scores_${group.code}`, JSON.stringify(group.players));
            }
          });
        }
      } catch (err) {
        console.warn('Failed to fetch latest tournament data for leaderboard sync:', err);
      }
    };

    const loadData = () => {
      const savedTournament = localStorage.getItem('active_tournament');
      if (!savedTournament) {
        return;
      }
      const tournamentData = JSON.parse(savedTournament);
      setTournamentName(tournamentData.info?.name || 'Active Tournament');
      const dbGroups = tournamentData.groups || [];
      
      let collectedPlayers: any[] = [];

      dbGroups.forEach((group: any) => {
        const groupScoresStr = localStorage.getItem(`tournament_scores_${group.code}`);
        let groupPlayers = group.players || [];
        
        if (groupScoresStr) {
           const parsedScores = JSON.parse(groupScoresStr);
           groupPlayers = parsedScores;
        } else {
           groupPlayers = groupPlayers.map((p: any) => ({
             ...p,
             scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) },
             manualTotal: null
           }));
        }

        groupPlayers.forEach((p: any) => {
           if (p.name !== '-') {
             collectedPlayers.push({
               ...p,
               groupCode: group.code,
               groupName: group.name || group.code,
               flightType: p.flight || group.flightType || 'A'
             });
           }
        });
      });

      setAllPlayersData(collectedPlayers);
    };

    loadData();
    fetchLatestData().then(loadData);
    const interval = setInterval(() => {
      fetchLatestData().then(loadData);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRelativeScore = (player: any) => {
    if (!player.scores) return '0';

    let totalPar = 0;
    let totalStrokes = 0;

    if (player.scores.IN) {
      player.scores.IN.forEach((score: any, idx: number) => {
        if (typeof score === 'number' && score > 0 && holeData.IN[idx]) {
          totalStrokes += score;
          totalPar += holeData.IN[idx].par;
        }
      });
    }

    if (player.scores.OUT) {
      player.scores.OUT.forEach((score: any, idx: number) => {
        if (typeof score === 'number' && score > 0 && holeData.OUT[idx]) {
          totalStrokes += score;
          totalPar += holeData.OUT[idx].par;
        }
      });
    }

    if (totalStrokes === 0) {
      if (player.relative) {
        return player.relative === 'E' ? '0' : player.relative;
      }
      return '0';
    }
    
    // New requested formula (corrected): Score - Par (per hole, sum)
    const diff = totalStrokes - totalPar;
    return diff > 0 ? `+${diff}` : diff === 0 ? '0' : diff;
  };

  const getTotalScore = (player: any) => {
    if (!player.scores) return player.manualTotal || 0;
    const inTotal = player.scores.IN ? player.scores.IN.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) : 0;
    const outTotal = player.scores.OUT ? player.scores.OUT.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) : 0;
    
    const calculatedTotal = inTotal + outTotal;
    if (calculatedTotal === 0 && player.manualTotal) {
      return player.manualTotal;
    }
    return calculatedTotal;
  };

  const getHoleProgress = (player: any) => {
    if (!player.scores) return 0;
    const inPlayed = player.scores.IN ? player.scores.IN.filter((s: any) => typeof s === 'number' && s > 0).length : 0;
    const outPlayed = player.scores.OUT ? player.scores.OUT.filter((s: any) => typeof s === 'number' && s > 0).length : 0;
    return inPlayed + outPlayed;
  };

  const isPlayerOut = (player: any) => {
    if (!player.scores) return false;
    const inOut = player.scores.IN ? player.scores.IN.includes('OUT') : false;
    const outOut = player.scores.OUT ? player.scores.OUT.includes('OUT') : false;
    return inOut || outOut;
  };

  const filteredPlayers = allPlayersData.filter(p => {
    if (filterMode === 'FlightA') return p.flightType === 'A';
    if (filterMode === 'FlightB') return p.flightType === 'B';
    if (filterMode === 'FlightC') return p.flightType === 'C';
    if (filterMode === 'Group') return p.groupCode === currentGroupCode;
    if (filterMode === 'Flight') {
      const myFlight = allPlayersData.find(ap => ap.groupCode === currentGroupCode)?.flightType;
      return p.flightType === (currentFlight || myFlight);
    }
    return true; // Overall
  });

  const sortedPlayers = [...filteredPlayers]
    .map(p => {
      const relativeScore = getRelativeScore(p);
      const numericRelative = typeof relativeScore === 'number' ? relativeScore : (relativeScore === '0' || relativeScore === 'E' ? 0 : parseInt(relativeScore as string) || 0);
      return {
        ...p,
        grossScore: getTotalScore(p),
        totalHoles: getHoleProgress(p),
        isOut: isPlayerOut(p),
        numericRelative
      };
    })
    .sort((a, b) => {
      if (a.isOut && !b.isOut) return 1;
      if (!a.isOut && b.isOut) return -1;
      
      // Put players with 0 gross score (haven't played) at the bottom
      if (a.grossScore === 0 && b.grossScore > 0) return 1;
      if (b.grossScore === 0 && a.grossScore > 0) return -1;
      
      // 1. Sort by Score To Par (lowest/most negative first)
      if (a.numericRelative !== b.numericRelative) return a.numericRelative - b.numericRelative;
      
      // 2. If tied, sort by holes played (most holes first is better)
      if (a.totalHoles !== b.totalHoles) return b.totalHoles - a.totalHoles;
      
      // 3. If still tied, sort by gross score (lowest first)
      if (a.grossScore !== b.grossScore) return a.grossScore - b.grossScore;
      
      return a.name.localeCompare(b.name);
    });

  useEffect(() => {
    // Implement auto-scroll if there are many players
    const scrollContainer = document.getElementById('leaderboard-scroll-container');
    if (!scrollContainer) return;

    let scrollPos = 0;
    let direction = 1; // 1 for down, -1 for up
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    
    // Only auto-scroll if content is taller than container
    if (maxScroll <= 0) return;

    const scrollInterval = setInterval(() => {
      // Don't auto scroll if a player is expanded
      if (expandedPlayerId !== null) return;

      scrollPos += direction * 1; // scroll speed
      
      if (scrollPos >= maxScroll) {
        direction = -1;
        scrollPos = maxScroll;
      } else if (scrollPos <= 0) {
        direction = 1;
        scrollPos = 0;
      }
      
      scrollContainer.scrollTop = scrollPos;
    }, 50); // 50ms interval for smooth scroll

    return () => clearInterval(scrollInterval);
  }, [sortedPlayers.length, expandedPlayerId]);

  return (
    <div className="w-full h-screen bg-[#000a20] overflow-hidden flex flex-col font-sans relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-black/40 pointer-events-none" />

      <div className="flex flex-col md:flex-row flex-1 w-full h-full overflow-hidden relative z-10">
        <div className="w-full md:w-[320px] px-4 py-4 md:px-5 lg:px-6 md:pb-6 lg:pb-8 md:pt-4 lg:pt-6 flex flex-col justify-between border-b md:border-b-0 border-r-0 md:border-r border-white/10 bg-[#b85a29] shadow-2xl relative z-30 overflow-hidden shrink-0">
          <div className="flex-1 min-h-0 relative z-10 flex flex-col">
            <div className="flex flex-col h-full justify-between gap-3 lg:gap-4">
              <div className="flex justify-center shrink-0 mb-2 lg:mb-4">
                <img src="/logo1.png" alt="Golfinity" className="h-12 lg:h-16 object-contain drop-shadow-lg" />
              </div>
              
              <div className="flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2 lg:gap-3">
                  <Activity size={16} className="text-white/80 lg:w-[18px] lg:h-[18px]" />
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] leading-tight">TOURNAMENT<br/>INFO</span>
                </div>
                <div className="flex items-center gap-2 bg-black/10 px-2.5 lg:px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock size={12} className="text-white/60" />
                  <span className="text-[9px] lg:text-[10px] font-black tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              <div className="relative flex-1 min-h-0 max-h-[280px] w-full flex flex-col justify-center">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex flex-col items-center justify-center p-4 lg:p-6 text-center">
                  <div className="text-4xl lg:text-5xl font-black text-white italic mb-1 lg:mb-2 leading-tight">LIVE<br/>SCORE</div>
                  <div className="w-16 lg:w-20 h-1 bg-white/40 my-3 lg:my-4" />
                  <div className="text-[10px] lg:text-xs font-bold text-white/80 uppercase tracking-widest italic">{tournamentName || 'Tournament'}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:gap-4 shrink-0">
                <div className="bg-white/10 p-3 lg:p-4 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1.5 lg:space-y-2">
                  <span className="text-[10px] lg:text-[11px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1.5 lg:mb-2">Filter Klasemen</span>
                  <div className="relative">
                    <select 
                      value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value as any)}
                      className="w-full bg-black/40 text-white/90 border border-white/20 rounded-xl py-2.5 lg:py-3 px-3 lg:px-4 outline-none focus:border-[#ff7b5a] transition-all appearance-none font-bold text-xs lg:text-sm cursor-pointer hover:bg-black/60"
                    >
                      <option value="Overall">1. All Players</option>
                      <option value="FlightA">2. Flight A</option>
                      <option value="FlightB">3. Flight B</option>
                      <option value="FlightC">4. Flight C</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-3 lg:h-2">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-white/10 p-3 lg:p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                    <span className="text-[9px] lg:text-[11px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1.5 lg:mb-2">Total Players</span>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl lg:text-5xl font-black italic text-white leading-none drop-shadow-xl">{sortedPlayers.length}</span>
                      <Users size={20} className="text-white/30 lg:w-7 lg:h-7" />
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 lg:p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col justify-center overflow-hidden">
                    <span className="text-[9px] lg:text-[11px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1.5 lg:mb-2">Current Leader</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Trophy size={20} className="text-amber-300 shrink-0 lg:w-6 lg:h-6" />
                      <span className="text-sm lg:text-lg font-black text-white uppercase italic truncate drop-shadow-md">{sortedPlayers[0]?.name || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 lg:pt-6 shrink-0 mt-auto">
              <button 
                onClick={() => {
                  if (viewMode === 'summary') setViewMode('detailed');
                  else if (viewMode === 'detailed') setViewMode('detailed_par');
                  else setViewMode('summary');
                }}
                className="w-full py-4 bg-[#2b5ba4] hover:bg-[#3a6bb8] text-white rounded-[16px] text-sm font-black uppercase tracking-[0.2em] transition-all border border-white/10 active:scale-95 shadow-lg"
              >
                {viewMode === 'summary' ? 'DETAILED SCORE' : viewMode === 'detailed' ? 'DETAILED PAR' : 'SUMMARY SCORE'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-0 bg-[#0f2824] relative z-20">
          <div className="bg-[#14342d] px-6 py-4 flex justify-between items-center shrink-0 border-b border-white/5">
            <div className="flex items-center gap-2">
              <img src="/logo1.png" alt="Logo" className="h-6 w-auto object-contain brightness-0 invert" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white">GolfinityConnect Monitoring</span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all text-white/70 hover:text-white"
            >
              <Maximize size={20} />
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            {viewMode === 'summary' ? (
              <>
                {/* Table Header - Solid Green */}
                <div className="flex items-center px-4 md:px-6 lg:px-10 py-4 bg-[#14342d] border-b border-white/5 shadow-md z-30">
                  <span className="w-12 md:w-16 lg:w-20 text-[10px] font-black text-white/70 uppercase tracking-widest">Rank</span>
                  <span className="flex-1 text-[10px] font-black text-white/70 uppercase tracking-widest min-w-[120px]">Player</span>
                  <span className="w-24 md:w-32 lg:w-40 text-[10px] font-black text-white/70 uppercase tracking-widest text-center">Score (To Par)</span>
                  <span className="w-24 md:w-32 lg:w-40 text-[10px] font-black text-white/70 uppercase tracking-widest text-center">Total Score (Gross)</span>
                  <span className="w-16 md:w-20 lg:w-24 text-[10px] font-black text-white/70 uppercase tracking-widest text-center">Hole</span>
                </div>

                {/* Top 4 Players - Sticky/Fixed at the top */}
                {sortedPlayers.slice(0, 4).map((player: any, idx: number) => {
                  const relativeScore = getRelativeScore(player);
                  return (
                    <div 
                      key={`top-${player.id || idx}`}
                      onClick={() => setExpandedPlayerId(expandedPlayerId === (player.id || idx) ? null : (player.id || idx))}
                      className={`flex items-center px-4 md:px-6 lg:px-10 py-5 border-b border-white/5 transition-all cursor-pointer hover:bg-white/5 shrink-0 z-20 shadow-sm
                        ${player.isOut ? 'bg-[#ff7b5a]/5 hover:bg-[#ff7b5a]/10' : ''}
                        ${idx === 0 ? 'bg-gradient-to-r from-amber-500/20 to-[#0a1e1b] border-amber-500/30' : 
                          idx === 1 ? 'bg-gradient-to-r from-slate-300/20 to-[#0c2320] border-slate-300/30' : 
                          idx === 2 ? 'bg-gradient-to-r from-orange-400/20 to-[#0a1e1b] border-orange-400/30' : 
                          'bg-[#0c2320]'}
                      `}
                    >
                  <div className="w-12 md:w-16 lg:w-20 flex items-center relative">
                    {idx === 0 && <Crown size={16} className="absolute -left-5 text-amber-400 drop-shadow-md" />}
                    <span className={`text-2xl font-black italic ${player.isOut ? 'text-orange-400/50' : 
                      idx === 0 ? 'text-amber-400' : 
                      idx === 1 ? 'text-slate-300' : 
                      idx === 2 ? 'text-orange-400' : 
                      'text-white'}`}>
                      {player.isOut ? '-' : idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center gap-4 min-w-[120px]">
                    <span className={`text-2xl font-black uppercase italic tracking-tight truncate ${player.isOut ? 'text-orange-300/50 line-through decoration-orange-500/50' : 
                      idx === 0 ? 'text-amber-400 drop-shadow-sm' : 'text-white'}`}>
                      {player.name}
                    </span>
                    {player.flightType && (
                      <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-black rounded border border-white/20 uppercase tracking-widest hidden md:inline-block">
                        FLIGHT {player.flightType}
                      </span>
                    )}
                    {player.isOut && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded border border-orange-500/30 uppercase tracking-widest">
                        NR
                      </span>
                    )}
                  </div>

                  <div className="w-24 md:w-32 lg:w-40 flex flex-col items-center">
                    <span className={`text-3xl font-black italic tracking-tighter ${player.isOut ? 'text-orange-400/30' : typeof relativeScore === 'number' && relativeScore < 0 ? 'text-[#ff7b5a] drop-shadow-[0_0_10px_rgba(255,123,90,0.3)]' : typeof relativeScore === 'number' && relativeScore > 0 ? 'text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-white/50'}`}>
                      {player.isOut ? '-' : relativeScore}
                    </span>
                  </div>

                  <div className="w-24 md:w-32 lg:w-40 flex flex-col items-center">
                    <span className={`text-2xl font-black italic tracking-tighter ${player.isOut ? 'text-orange-400/30' : 'text-white'}`}>
                      {player.isOut ? '-' : getTotalScore(player)}
                    </span>
                  </div>

                  <div className="w-16 md:w-20 lg:w-24 flex flex-col items-center">
                    <span className={`text-2xl font-black italic ${player.isOut ? 'text-orange-400/30' : 'text-white'}`}>
                      {player.isOut ? '-' : `${getHoleProgress(player)}/18`}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Table Body - Scrollable section for Rank 5+ */}
            <div id="monitoring-score-scroll-container" className="flex-1 overflow-y-auto custom-scrollbar-dark scroll-smooth relative z-10">
              {sortedPlayers.length > 4 ? (
                sortedPlayers.slice(4).map((player: any, originalIdx: number) => {
                  const idx = originalIdx + 4; // Adjust index for display
                  const relativeScore = getRelativeScore(player);
                  const isPositive = relativeScore.toString().startsWith('+');
                  const isEven = relativeScore === '0' || relativeScore === 'E';

                  return (
                    <React.Fragment key={player.id || idx}>
                      <div 
                        onClick={() => setExpandedPlayerId(expandedPlayerId === (player.id || idx) ? null : (player.id || idx))}
                        className={`flex items-center px-4 md:px-6 lg:px-10 py-6 border-b border-white/5 transition-all cursor-pointer hover:bg-white/5
                          ${player.isOut ? 'bg-[#ff7b5a]/5 hover:bg-[#ff7b5a]/10' : ''}
                          ${idx % 2 === 0 ? 'bg-[#0a1e1b]' : 'bg-[#0c2320]'}
                        `}
                      >
                        <div className="w-12 md:w-16 lg:w-20 flex items-center">
                          <span className={`text-2xl font-black italic ${player.isOut ? 'text-orange-400/50' : 'text-white'}`}>
                            {player.isOut ? '-' : idx + 1}
                          </span>
                        </div>

                        <div className="flex-1 flex items-center gap-4 min-w-[120px]">
                          <span className={`text-2xl font-black uppercase italic tracking-tight truncate ${player.isOut ? 'text-orange-300/50 line-through decoration-orange-500/50' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {player.flightType && (
                            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-black rounded border border-white/20 uppercase tracking-widest hidden md:inline-block">
                              FLIGHT {player.flightType}
                            </span>
                          )}
                          {player.isOut && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded border border-orange-500/30 uppercase tracking-widest">
                              NR
                            </span>
                          )}
                        </div>

                        <div className="w-24 md:w-32 lg:w-40 flex flex-col items-center">
                          <span className={`text-3xl font-black italic tracking-tighter ${player.isOut ? 'text-orange-400/30' : typeof relativeScore === 'number' && relativeScore < 0 ? 'text-[#ff7b5a] drop-shadow-[0_0_10px_rgba(255,123,90,0.3)]' : typeof relativeScore === 'number' && relativeScore > 0 ? 'text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-white/50'}`}>
                            {player.isOut ? '-' : relativeScore}
                          </span>
                        </div>

                        <div className="w-24 md:w-32 lg:w-40 flex flex-col items-center">
                          <span className={`text-2xl font-black italic tracking-tighter ${player.isOut ? 'text-orange-400/30' : 'text-white'}`}>
                            {player.isOut ? '-' : getTotalScore(player)}
                          </span>
                        </div>

                        <div className="w-16 md:w-20 lg:w-24 flex flex-col items-center">
                          <span className={`text-2xl font-black italic ${player.isOut ? 'text-orange-400/30' : 'text-white'}`}>
                            {player.isOut ? '-' : `${getHoleProgress(player)}/18`}
                          </span>
                        </div>
                      </div>

                      {expandedPlayerId === (player.id || idx) && (
                        <div className="w-full bg-[#0f2824] p-8 border-b border-[#ff7b5a]/30 shadow-inner">
                          <div className="max-w-5xl mx-auto space-y-8">
                            <div>
                              <h4 className="text-[#ff7b5a] text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ff7b5a]"></div>
                                IN (Hole 1-9)
                              </h4>
                              <div className="flex gap-3">
                                {holeData.IN.map((hole, i) => (
                                  <div key={hole.num} className="flex-1 bg-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
                                    <span className="text-[11px] text-white/50 font-bold mb-2">H{hole.num}</span>
                                    <span className="text-2xl xl:text-3xl font-black text-white italic">
                                      {player.scores?.IN?.[i] === 0 || player.scores?.IN?.[i] === null ? '-' : player.scores?.IN?.[i]}
                                    </span>
                                    <span className="text-[10px] text-[#ff7b5a]/60 font-bold mt-2 bg-[#ff7b5a]/10 px-2 py-0.5 rounded-md">P{hole.par}</span>
                                  </div>
                                ))}
                                <div className="flex-1 bg-gradient-to-br from-[#14342d] to-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/30 shadow-[0_0_15px_rgba(255,123,90,0.1)]">
                                  <span className="text-[11px] text-[#ff7b5a] font-black mb-1 uppercase tracking-widest">IN</span>
                                  <span className="text-2xl xl:text-3xl font-black text-white italic drop-shadow-md">
                                    {player.scores?.IN?.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[#ff7b5a] text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ff7b5a]"></div>
                                OUT (Hole 10-18)
                              </h4>
                              <div className="flex gap-3">
                                {holeData.OUT.map((hole, i) => (
                                  <div key={hole.num} className="flex-1 bg-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
                                    <span className="text-[11px] text-white/50 font-bold mb-2">H{hole.num}</span>
                                    <span className="text-2xl xl:text-3xl font-black text-white italic">
                                      {player.scores?.OUT?.[i] === 0 || player.scores?.OUT?.[i] === null ? '-' : player.scores?.OUT?.[i]}
                                    </span>
                                    <span className="text-[10px] text-[#ff7b5a]/60 font-bold mt-2 bg-[#ff7b5a]/10 px-2 py-0.5 rounded-md">P{hole.par}</span>
                                  </div>
                                ))}
                                <div className="flex-1 bg-gradient-to-br from-[#14342d] to-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/30 shadow-[0_0_15px_rgba(255,123,90,0.1)]">
                                  <span className="text-[11px] text-[#ff7b5a] font-black mb-1 uppercase tracking-widest">OUT</span>
                                  <span className="text-2xl xl:text-3xl font-black text-white italic drop-shadow-md">
                                    {player.scores?.OUT?.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10">
                  <Activity size={200} className="text-white mb-10 animate-pulse" />
                  <span className="text-5xl font-black text-white uppercase tracking-[0.6em] italic">No Tournament Data</span>
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center px-4 md:px-6 lg:px-10 py-4 bg-[#14342d] border-b border-white/5 shadow-md z-30 shrink-0">
                <span className="w-12 md:w-16 lg:w-20 text-[10px] font-black text-white/70 uppercase tracking-widest">Rank</span>
                <span className="w-48 text-[10px] font-black text-white/70 uppercase tracking-widest">Player</span>
                <div className="flex-1 flex justify-between px-4">
                  {[...holeData.IN, ...holeData.OUT].map((hole, i) => (
                    <div key={hole.num} className="flex flex-col items-center w-8">
                      <span className="text-[10px] font-black text-white/70 uppercase">H{hole.num}</span>
                    </div>
                  ))}
                </div>
                <span className="w-16 text-[10px] font-black text-white/70 uppercase tracking-widest text-center">Gross</span>
              </div>
              <div id="monitoring-detailed-score-scroll" className="flex-1 overflow-y-auto custom-scrollbar-dark scroll-smooth">
                {sortedPlayers.map((player: any, idx: number) => {
                  return (
                    <div 
                      key={player.id || idx}
                      className={`flex items-center px-4 md:px-6 lg:px-10 py-4 border-b border-white/5 transition-all
                        ${player.isOut ? 'bg-[#ff7b5a]/5' : ''}
                        ${idx % 2 === 0 ? 'bg-[#0a1e1b]' : 'bg-[#0c2320]'}
                      `}
                    >
                      <div className="w-12 md:w-16 lg:w-20 flex items-center">
                        <span className={`text-xl font-black italic ${player.isOut ? 'text-orange-400/50' : 'text-white'}`}>
                          {player.isOut ? '-' : idx + 1}
                        </span>
                      </div>

                      <div className="w-48 flex items-center gap-2">
                        <span className={`text-lg font-black uppercase italic tracking-tight truncate ${player.isOut ? 'text-orange-300/50 line-through decoration-orange-500/50' : 'text-white'}`}>
                          {player.name}
                        </span>
                      </div>

                      <div className="flex-1 flex justify-between px-4">
                        {[...holeData.IN, ...holeData.OUT].map((hole, i) => {
                          const scoreArray = i < 9 ? player.scores?.IN : player.scores?.OUT;
                          const scoreIdx = i < 9 ? i : i - 9;
                          const rawScore = scoreArray?.[scoreIdx];
                          const displayScore = (rawScore === 0 || rawScore === null) ? '-' : rawScore === 'OUT' ? 'NR' : (viewMode === 'detailed_par' ? (rawScore - hole.par > 0 ? `+${rawScore - hole.par}` : rawScore - hole.par === 0 ? '0' : rawScore - hole.par) : rawScore);
                          
                          return (
                            <div key={hole.num} className="w-8 flex justify-center">
                              <span className={`text-lg font-black italic ${displayScore === '-' ? 'text-white/30' : (viewMode === 'detailed_par' && typeof displayScore === 'string' && displayScore.startsWith('+') ? 'text-[#3b82f6]' : viewMode === 'detailed_par' && typeof displayScore === 'number' && displayScore < 0 ? 'text-[#ff7b5a]' : 'text-white')}`}>
                                {displayScore}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-16 flex justify-center">
                        <span className={`text-xl font-black italic ${player.isOut ? 'text-orange-400/30' : 'text-white'}`}>
                          {player.isOut ? '-' : viewMode === 'detailed_par' ? getRelativeScore(player) : getTotalScore(player)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringScoreTournament;
