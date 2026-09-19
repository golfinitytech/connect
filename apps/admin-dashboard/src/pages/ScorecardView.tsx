import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Map as MapIcon, 
  BarChart3, 
  Camera, 
  UtensilsCrossed, 
  Grid,
  Globe
} from 'lucide-react';
import ScoreInputModal from '../components/ScoreInputModal';
import LeaderboardModal from '../components/LeaderboardModal';

const ScorecardView = () => {
  const navigate = useNavigate();
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentLang, setCurrentLang] = useState('ID');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeNine, setActiveNine] = useState<'IN' | 'OUT'>('IN');
  const [isTotalInputMode, setIsTotalInputMode] = useState(false);
  
  // Tablet Code State
  const [tabletCode, setTabletCode] = useState(() => {
    const savedCode = localStorage.getItem('golf_tablet_code');
    if (savedCode) return savedCode;
    // Generate random 4-digit code
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('golf_tablet_code', newCode);
    return newCode;
  });

  // Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [selectedScoreData, setSelectedScoreData] = useState<{
    playerId: number;
    playerName: string;
    holeNumber: number;
    currentScore: number | null;
    isTotal?: boolean;
  } | null>(null);

  // Par and Index data for holes
  const holeData = {
    IN: [
      { num: 1, par: 4, index: 10 },
      { num: 2, par: 3, index: 18 },
      { num: 3, par: 4, index: 2 },
      { num: 4, par: 5, index: 6 },
      { num: 5, par: 4, index: 14 },
      { num: 6, par: 4, index: 12 },
      { num: 7, par: 3, index: 4 },
      { num: 8, par: 4, index: 16 },
      { num: 9, par: 5, index: 8 },
    ],
    OUT: [
      { num: 10, par: 4, index: 9 },
      { num: 11, par: 3, index: 17 },
      { num: 12, par: 4, index: 1 },
      { num: 13, par: 4, index: 5 },
      { num: 14, par: 5, index: 13 },
      { num: 15, par: 4, index: 11 },
      { num: 16, par: 3, index: 15 },
      { num: 17, par: 5, index: 3 },
      { num: 18, par: 4, index: 7 },
    ]
  };

  const [players, setPlayers] = useState([
    { 
      id: 1, 
      name: '-', 
      manualTotal: null as number | null,
      scores: {
        IN: Array(9).fill(0),
        OUT: Array(9).fill(0)
      }
    },
    { 
      id: 2, 
      name: '-', 
      manualTotal: null as number | null,
      scores: {
        IN: Array(9).fill(0),
        OUT: Array(9).fill(0)
      }
    },
    { 
      id: 3, 
      name: '-', 
      manualTotal: null as number | null,
      scores: {
        IN: Array(9).fill(0),
        OUT: Array(9).fill(0)
      }
    },
    { 
      id: 4, 
      name: '-', 
      manualTotal: null as number | null,
      scores: {
        IN: Array(9).fill(0),
        OUT: Array(9).fill(0)
      }
    },
  ]);

  const calculateTotal = (playerScores: (number | null)[]) => {
    return playerScores.reduce((acc, curr) => acc + (curr || 0), 0);
  };

  const getPlayerStats = (player: typeof players[0]) => {
    if (isTotalInputMode && player.manualTotal !== null) {
      return {
        in: 0,
        out: 0,
        total: player.manualTotal
      };
    }
    const inTotal = calculateTotal(player.scores.IN);
    const outTotal = calculateTotal(player.scores.OUT);
    return {
      in: inTotal,
      out: outTotal,
      total: inTotal + outTotal
    };
  };

  const handleScoreClick = (player: typeof players[0], holeNum: number, currentScore: number | null) => {
    if (isTotalInputMode) return;
    setSelectedScoreData({
      playerId: player.id,
      playerName: player.name,
      holeNumber: holeNum,
      currentScore: currentScore
    });
    setIsScoreModalOpen(true);
  };

  const handleTotalClick = (player: typeof players[0]) => {
    setSelectedScoreData({
      playerId: player.id,
      playerName: player.name,
      holeNumber: 0, // 0 indicates total
      currentScore: isTotalInputMode ? player.manualTotal : null,
      isTotal: true
    });
    setIsScoreModalOpen(true);
  };

  const handleSaveScore = (newScore: number | null) => {
    if (!selectedScoreData) return;

    setPlayers(prev => {
      const updatedPlayers = prev.map(p => {
        if (p.id === selectedScoreData.playerId) {
          if (selectedScoreData.isTotal) {
            return { ...p, manualTotal: newScore };
          } else {
            const newScores = { ...p.scores };
            const index = holeData[activeNine].findIndex(h => h.num === selectedScoreData.holeNumber);
            if (index !== -1) {
              newScores[activeNine][index] = newScore;
            }
            return { ...p, scores: newScores };
          }
        }
        return p;
      });
      // Save to localStorage for other views
      localStorage.setItem('golf_players_scores', JSON.stringify(updatedPlayers));
      return updatedPlayers;
    });
  };

  useEffect(() => {
    // Initial load from localStorage
    const savedScores = localStorage.getItem('golf_players_scores');
    const savedPlayersData = localStorage.getItem('golf_players_data');
    
    if (savedScores) {
      setPlayers(JSON.parse(savedScores));
    } else if (savedPlayersData) {
      // If no scores yet, but player names exist in Round Settings, use those names
      const playersData = JSON.parse(savedPlayersData);
      setPlayers(prev => prev.map(p => {
        const matchingData = playersData.find((pd: any) => pd.id === p.id);
        if (matchingData && matchingData.name) {
          return { ...p, name: matchingData.name };
        }
        return p;
      }));
    }

    // Listen for storage changes from other tabs/modals
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'golf_players_scores' && e.newValue) {
        setPlayers(JSON.parse(e.newValue));
      } else if (e.key === 'golf_players_data' && e.newValue && !localStorage.getItem('golf_players_scores')) {
        // Only update names if we haven't started scoring yet
        const playersData = JSON.parse(e.newValue);
        setPlayers(prev => prev.map(p => {
          const matchingData = playersData.find((pd: any) => pd.id === p.id);
          if (matchingData && matchingData.name) {
            return { ...p, name: matchingData.name };
          }
          return p;
        }));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        setBatteryLevel(Math.round(battery.level * 100));

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }
    };
    getBatteryStatus();
  }, []);

  const currentHoles = holeData[activeNine];

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-800 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="bg-[#1e293b] text-white flex items-center justify-between px-4 h-14 shrink-0">
        <div className="flex items-center gap-6 h-full">
          <div className="flex flex-col justify-center border-r border-slate-700 pr-6">
             <span className="text-xs font-bold text-slate-400">{activeNine} ^</span>
             <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Par / Index</span>
          </div>
          <div className="flex gap-1">
            {currentHoles.map((hole) => (
              <div key={hole.num} className={`flex flex-col items-center min-w-[50px] transition-opacity ${isTotalInputMode ? 'opacity-30' : 'opacity-100'}`}>
                <span className="text-lg font-black leading-none">{hole.num}</span>
                <span className="text-[10px] font-bold text-blue-400">
                  {hole.par}/{hole.index}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-0 border-l border-slate-700 items-center h-full ml-4">
            <button 
              onClick={() => setActiveNine('IN')}
              disabled={isTotalInputMode}
              className={`px-4 h-full flex items-center text-xs font-bold uppercase transition-colors ${activeNine === 'IN' && !isTotalInputMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'} ${isTotalInputMode ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              In
            </button>
            <button 
              onClick={() => setActiveNine('OUT')}
              disabled={isTotalInputMode}
              className={`px-4 h-full flex items-center text-xs font-bold uppercase transition-colors ${activeNine === 'OUT' && !isTotalInputMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'} ${isTotalInputMode ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              Out
            </button>
            <div className={`h-full flex items-center px-4 transition-colors ${isTotalInputMode ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <span className="text-xs font-bold uppercase">Total</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Mode Toggle */}
          <button 
            onClick={() => setIsTotalInputMode(!isTotalInputMode)}
            className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${isTotalInputMode ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
          >
            {isTotalInputMode ? 'Mode: Total Skor' : 'Mode: Hole Skor'}
          </button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">The Tomorrow of Golf</span>
            <span className="text-xl font-black tracking-tighter italic">GOLFINITYSCORE</span>
          </div>
          <div 
            onClick={() => setCurrentLang(prev => prev === 'ID' ? 'EN' : 'ID')}
            className="flex flex-col items-center border-l border-slate-700 pl-4 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Globe size={18} className="text-slate-400" />
            <span className="text-[8px] font-bold uppercase">{currentLang}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Score Table */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1">
            {players.map((player, pIdx) => {
              const stats = getPlayerStats(player);
              const activeScores = player.scores[activeNine];

              return (
                <div key={player.id} className={`flex border-b border-slate-100 min-h-[100px] ${pIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  {/* Player Name & Input Btn */}
                  <div className="w-24 shrink-0 flex flex-col items-center justify-center border-r border-slate-100 p-2 gap-2">
                    <span className={`font-black text-lg truncate w-full text-center ${player.name === '-' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {player.name}
                    </span>
                    {player.name !== '-' && (
                      <button 
                        onClick={() => handleTotalClick(player)}
                        className="text-[8px] font-bold border border-slate-300 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        Input
                      </button>
                    )}
                  </div>

                  {/* Hole Scores */}
                  <div className="flex-1 flex items-center justify-around px-2">
                    {activeScores.map((score, sIdx) => {
                      const isEmptyPlayer = player.name === '-';
                      return (
                        <div 
                          key={sIdx} 
                          onClick={() => !isEmptyPlayer && handleScoreClick(player, currentHoles[sIdx].num, score)}
                          className={`min-w-[50px] flex flex-col items-center justify-center relative group transition-opacity ${isTotalInputMode ? 'opacity-10' : 'opacity-100'} ${!isEmptyPlayer ? 'cursor-pointer' : ''}`}
                        >
                          {pIdx === 0 && sIdx === 1 && activeNine === 'OUT' && (
                            <div className="absolute -top-6 text-red-500 text-xs">🦋</div>
                          )}
                          <span className={`text-3xl font-black transition-all ${isEmptyPlayer ? 'text-slate-200' : 'text-slate-800 group-hover:text-slate-400'}`}>
                            {isEmptyPlayer ? '-' : score}
                          </span>
                          {!isEmptyPlayer && (
                             <div className="flex gap-1 mt-1">
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                             </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Stats */}
                  <div className="w-48 shrink-0 flex items-center bg-slate-50/50">
                    <div className={`flex-1 flex flex-col items-center border-l border-slate-100 h-full justify-center ${activeNine === 'IN' && !isTotalInputMode ? 'bg-blue-50/50' : ''} transition-opacity ${isTotalInputMode ? 'opacity-10' : 'opacity-100'}`}>
                      <span className={`text-2xl font-black ${player.name === '-' ? 'text-slate-200' : activeNine === 'IN' ? 'text-blue-700' : 'text-slate-400'}`}>
                        {player.name === '-' ? '-' : stats.in}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      </div>
                    </div>
                    <div className={`flex-1 flex flex-col items-center border-l border-slate-100 h-full justify-center ${activeNine === 'OUT' && !isTotalInputMode ? 'bg-blue-50/50' : ''} transition-opacity ${isTotalInputMode ? 'opacity-10' : 'opacity-100'}`}>
                      <span className={`text-2xl font-black ${player.name === '-' ? 'text-slate-200' : activeNine === 'OUT' ? 'text-blue-700' : 'text-slate-400'}`}>
                        {player.name === '-' ? '-' : stats.out}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      </div>
                    </div>
                    <div 
                      onClick={() => player.name !== '-' && handleTotalClick(player)}
                      className={`flex-1 flex flex-col items-center border-l border-slate-100 h-full justify-center transition-all ${player.name === '-' ? 'bg-slate-100' : isTotalInputMode ? 'bg-emerald-600 cursor-pointer hover:opacity-80' : 'bg-blue-600 cursor-pointer hover:opacity-80'}`}
                    >
                      <span className={`text-3xl font-black ${player.name === '-' ? 'text-blue-400/50' : 'text-white'}`}>
                        {player.name === '-' ? '-' : stats.total}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        <div className={`w-1 h-1 rounded-full ${player.name === '-' ? 'bg-blue-200' : 'bg-white/40'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <ScoreInputModal
            isOpen={isScoreModalOpen}
            onClose={() => setIsScoreModalOpen(false)}
            playerName={selectedScoreData?.playerName || ''}
            holeNumber={selectedScoreData?.holeNumber || 0}
            currentScore={selectedScoreData?.currentScore ?? null}
            onSave={handleSaveScore}
          />

          <LeaderboardModal
            isOpen={isLeaderboardOpen}
            onClose={() => setIsLeaderboardOpen(false)}
            tournamentName="Caddie Mode"
            variant="caddie"
            players={players.filter(p => p.name !== '-').map(p => ({
              ...p,
              approvals: {
                IN: Array(9).fill(true),
                OUT: Array(9).fill(true)
              }
            }))}
          />

          {/* Footer Navigation */}
          <footer className="h-16 bg-[#1e293b] text-white flex items-center justify-between px-6 shrink-0 border-t border-slate-700">
            <div className="flex items-center gap-6 h-full">
              <div 
                onClick={() => navigate('../caddie-mode', { state: { view: 'dashboard' } })}
                className="flex items-center cursor-pointer hover:bg-slate-700 px-4 h-full transition-colors text-slate-400 hover:text-white"
              >
                <Menu size={24} />
              </div>
              
              <div 
                className="flex items-center cursor-pointer hover:bg-slate-700 px-4 h-full transition-colors text-white"
              >
                <span className="font-bold uppercase text-sm tracking-widest">Skor</span>
              </div>
              
              <div 
                onClick={() => navigate('../gps-map')}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-700 px-4 h-full transition-colors text-slate-400 hover:text-white"
              >
                <MapIcon size={24} />
                <span className="font-bold uppercase text-sm tracking-widest">Peta GPS</span>
              </div>

              <div 
                onClick={() => setIsLeaderboardOpen(true)}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-700 px-4 h-full transition-colors text-slate-400 hover:text-white"
              >
                <BarChart3 size={24} />
                <span className="font-bold uppercase text-sm tracking-widest">Klasemen</span>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* Tablet Automatic Code for Kiosk Print */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Tablet Code</span>
                <div className="bg-emerald-500/10 border border-emerald-500/50 px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="text-2xl font-black text-emerald-400 tracking-[0.25em] font-mono leading-none">
                    {tabletCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <Camera 
                  size={20} 
                  className="cursor-pointer hover:text-blue-400 transition-colors" 
                  onClick={() => alert('Fitur Kamera akan segera hadir')}
                />
                <UtensilsCrossed 
                  size={20} 
                  className="cursor-pointer hover:text-blue-400 transition-colors" 
                  onClick={() => navigate('../resto-menu')}
                />
                <Grid 
                  size={20} 
                  className="cursor-pointer hover:text-blue-400 transition-colors" 
                  onClick={() => navigate('../caddie-mode')}
                />
              </div>

              <div className="flex items-center gap-6 border-l border-slate-700 pl-6 h-10">
                <div className="flex flex-col items-end text-[10px] font-bold">
                   <div className="flex gap-2 text-slate-500">
                      <span>OUT 00:00</span>
                      <span>IN 00:00</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-white text-lg font-black tracking-tighter">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-white/5">
                        <div className={`w-2 h-4 rounded-sm border border-white/20 relative overflow-hidden`}>
                            <div 
                              className={`absolute bottom-0 left-0 right-0 transition-all ${batteryLevel > 20 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                              style={{ height: `${batteryLevel}%` }} 
                            />
                        </div>
                        <span className="text-[10px] text-white/70">{batteryLevel}%</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ScorecardView;
