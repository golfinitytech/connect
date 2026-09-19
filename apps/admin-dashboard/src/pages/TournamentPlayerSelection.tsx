import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LeaderboardModal from '../components/LeaderboardModal';
import { 
  QrCode, 
  Search, 
  ChevronLeft, 
  User, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Maximize,
  Minimize,
  ShieldAlert
} from 'lucide-react';

const TournamentPlayerSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMarshall = location.pathname.includes('/marshall');
  const isMarshallScore = location.pathname.includes('/updatemarshallscore');
  const [playerCode, setPlayerCode] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<any>(null);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [caddiesMaster, setCaddiesMaster] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [marshalPassword, setMarshalPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // First try to fetch active tournament from API for multi-tablet support
      try {
        const { default: api } = await import('../services/api');
        const response = await api.get('/tournaments/active');
        if (response.data && Object.keys(response.data).length > 0) {
          const parsedData = {
            info: response.data,
            players: response.data.players,
            groups: response.data.groups,
            publishedAt: response.data.publishedAt
          };
          localStorage.setItem('active_tournament', JSON.stringify(parsedData));
          setTournamentInfo(parsedData.info);
        } else {
          localStorage.removeItem('active_tournament');
          setTournamentInfo(null);
        }
      } catch (err) {
        // Fallback to local storage
        const savedData = localStorage.getItem('active_tournament');
        if (savedData) {
          setTournamentInfo(JSON.parse(savedData).info);
        } else {
          setTournamentInfo(null);
        }
      }

      const savedCaddies = localStorage.getItem('golf_caddies_master');
      if (savedCaddies) {
        setCaddiesMaster(JSON.parse(savedCaddies));
      } else {
        const defaultCaddies = [
          { id: '001', name: '001', searchedName: 'Siti Aminah', gender: 'F', contact: '08123456789', qualificationDate: '2025-01-01', cartNo: '1', tabletNo: 'T01', batteryNo: 'B01' },
          { id: '002', name: '002', searchedName: 'Budi Santoso', gender: 'M', contact: '08123456790', qualificationDate: '2025-01-02', cartNo: '2', tabletNo: 'T02', batteryNo: 'B02' },
          { id: '117', name: '117', searchedName: 'Agnes Virani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '146', name: '146', searchedName: 'Putri Rahma Aulia', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '106', name: '106', searchedName: 'Heni Apriani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '137', name: '137', searchedName: 'Fitka Fatmawati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '141', name: '141', searchedName: 'Chintya Rahmawati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '112', name: '112', searchedName: 'Rika Veronika', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '108', name: '108', searchedName: 'Kurnia', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '128', name: '128', searchedName: 'Aprianti', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '122', name: '122', searchedName: 'Hilda Dwi Ananda', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '120', name: '120', searchedName: 'Desi Mulyanti', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '148', name: '148', searchedName: 'Shika Silviana A', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '151', name: '151', searchedName: 'Devi Purnomo', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '133', name: '133', searchedName: 'Anuti Sri Rahayu', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '123', name: '123', searchedName: 'Miswati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '121', name: '121', searchedName: 'Valeria Beku Nuamuri', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '145', name: '145', searchedName: 'Cahya Deshaningsih', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '131', name: '131', searchedName: 'Friska', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '104', name: '104', searchedName: 'Aura Adzania Berliantani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '129', name: '129', searchedName: 'Endah Wayanguri', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        ];
        setCaddiesMaster(defaultCaddies);
        localStorage.setItem('golf_caddies_master', JSON.stringify(defaultCaddies));
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    if (isMarshallScore) {
      setIsLeaderboardOpen(true);
    }
  }, [isMarshallScore]);

  const handleSearch = async () => {
    setError('');
    setFoundPlayer(null);

    let parsedData: any = null;

    try {
      // Always fetch latest from API when searching to support multiple tablets
      // @ts-ignore
      const { default: api } = await import('../services/api');
      const response = await api.get('/tournaments/active');
      if (response.data && Object.keys(response.data).length > 0) {
        parsedData = {
          info: response.data,
          players: response.data.players,
          groups: response.data.groups,
          publishedAt: response.data.publishedAt
        };
        localStorage.setItem('active_tournament', JSON.stringify(parsedData));
        setTournamentInfo(parsedData.info);
      } else {
        localStorage.removeItem('active_tournament');
        setTournamentInfo(null);
        parsedData = null;
      }
    } catch (error) {
      console.error('Error fetching tournament from API:', error);
      // Fallback to local storage if API is unreachable
      const tournamentData = localStorage.getItem('active_tournament');
      if (tournamentData) {
        parsedData = JSON.parse(tournamentData);
      }
    }

    if (!parsedData) {
      setError('No active tournament found in database.');
      return;
    }

    const groups = parsedData.groups || [];
    
    if (groups.length === 0) {
      setError('Tournament data is found, but no flight groups are generated. Please re-publish the tournament from Admin Dashboard.');
      return;
    }

    const normalizedInput = playerCode.trim().toUpperCase();
    
    // Find which group matches the entered code
    const group = groups.find((g: any) => g.code === normalizedInput);

    if (group) {
      const currentCaddie = group.caddie || { number: '000', name: 'Unassigned' };
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

      setFoundPlayer({
        isFlight: true,
        flightId: group.flightType,
        code: normalizedInput,
        players: group.players,
        caddie: {
          number: cleanNumber,
          name: cleanName
        }
      });
    } else {
      setError('Invalid Flight Access Code. Please check or scan again.');
    }
  };

  const handleStartGame = () => {
    if (foundPlayer) {
      // Save current flight session data for scorecard
      const sessionData = {
        flight: foundPlayer.code, // Use the unique access code (e.g. GF-OPEN-2026-001)
        players: foundPlayer.players,
        caddie: foundPlayer.caddie,
        startTime: new Date().toISOString()
      };
      localStorage.setItem('tournament_session', JSON.stringify(sessionData));
      
      // Update active_tournament with new caddie assignment if it was changed
      const tournamentData = localStorage.getItem('active_tournament');
      if (tournamentData) {
        const parsedData = JSON.parse(tournamentData);
        if (parsedData.groups) {
          const groupIndex = parsedData.groups.findIndex((g: any) => g.code === foundPlayer.code);
          if (groupIndex !== -1) {
            parsedData.groups[groupIndex].caddie = foundPlayer.caddie;
            localStorage.setItem('active_tournament', JSON.stringify(parsedData));
            
            // Try to sync with API silently
            api.post('/tournaments/sync-scores', {
              flightCode: foundPlayer.code,
              players: foundPlayer.players,
              caddie: foundPlayer.caddie
            }).catch(err => console.error('Failed to sync caddie update:', err));
          }
        }
      }

      // Navigate to the tournament scorecard
      navigate('../tournament-mode/scorecard');
    }
  };

  return (
    <div className="min-h-screen bg-[#004741] text-slate-100 p-6 font-sans flex flex-col items-center">
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          if (isMarshallScore) navigate('../marshall');
        }}
        tournamentName={tournamentInfo?.name || 'Tournament'}
        defaultViewMode={isMarshall || isMarshallScore ? 'detailed' : 'summary'}
        variant={isMarshall || isMarshallScore ? 'marshal' : 'default'}
      />
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-black text-white italic tracking-tight">
            {isMarshall ? 'Marshal Access' : 'Tournament Access'}
          </h1>
          <p className="text-white/70 font-medium">
            {isMarshall ? 'View tournament score' : 'Scan QR or Enter Code'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isMarshall && (
            <button
              onClick={() => navigate('../marshall')}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-sm active:scale-95"
              title="Marshal Access"
            >
              <ShieldAlert size={24} />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-sm active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Tournament Banner */}
        {tournamentInfo && (
          <div className="bg-blue-600 rounded-[32px] p-6 shadow-xl shadow-blue-600/20 flex items-center gap-4 border border-blue-400/30 animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight text-white">{tournamentInfo.name}</h2>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">{tournamentInfo.course}</p>
            </div>
          </div>
        )}

        {/* Search Input */}
        {isMarshall ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
            >
              <Trophy size={18} />
              Open Tournament Score
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative group">
              <input 
                list="flight-codes-list"
                type="text" 
                value={playerCode}
                onChange={(e) => setPlayerCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ENTER PLAYER CODE (e.g. GF-OPEN-2026-001)"
                className="w-full bg-white border border-slate-200 rounded-[24px] py-6 px-8 text-lg font-black tracking-widest placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center uppercase text-slate-800 shadow-sm"
              />
              <datalist id="flight-codes-list">
                {tournamentInfo?.groups?.map((g: any) => (
                  <option key={g.code} value={g.code}>
                    {g.flightType ? `Flight ${g.flightType}` : ''}
                  </option>
                ))}
              </datalist>
              <button 
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 text-white"
              >
                <Search size={20} />
              </button>
            </div>

            <button className="w-full py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 text-slate-600 font-black uppercase tracking-widest text-xs shadow-sm">
              <QrCode size={20} className="text-blue-600" />
              Scan QR Code
            </button>
          </div>
        )}

        {/* Result Area */}
        <div className="min-h-[200px]">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-[32px] flex items-start gap-4 animate-in slide-in-from-top-4 duration-300">
              <AlertCircle size={24} className="text-rose-600 shrink-0 mt-1" />
              <p className="text-sm font-bold text-rose-700 leading-relaxed uppercase">{error}</p>
            </div>
          )}

          {foundPlayer && (
            <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-xl animate-in zoom-in duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <CheckCircle2 size={120} className="text-emerald-600" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-50 rounded-[28px] border border-blue-100 flex items-center justify-center mb-6">
                  <Trophy size={40} className="text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-black uppercase italic text-center leading-none mb-1 text-slate-800">
                  FLIGHT {foundPlayer.flightId}
                </h3>
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Group Access Verified</span>
                </div>

                {/* Caddie Info Display */}
                {foundPlayer.caddie && (
                  <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                        <User size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Assigned Caddie</span>
                        <div className="flex items-center gap-2">
                          <input 
                            list="caddie-list"
                            type="text"
                            placeholder="Caddie No."
                            className="w-24 bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-sm font-black text-blue-600 outline-none focus:border-blue-500 transition-all text-center uppercase"
                            value={foundPlayer.caddie.number}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              let newName = 'Unassigned';
                              const masterCaddie = caddiesMaster.find((c: any) => c.name === val);
                              if (masterCaddie) {
                                newName = masterCaddie.searchedName;
                              }
                              setFoundPlayer({
                                ...foundPlayer,
                                caddie: { number: val, name: newName }
                              });
                            }}
                          />
                          <datalist id="caddie-list">
                            {caddiesMaster.map((c: any) => (
                              <option key={c.id || c.name} value={c.name}>{c.searchedName}</option>
                            ))}
                          </datalist>
                          <div className="w-1 h-1 rounded-full bg-blue-200 shrink-0" />
                          <span className="text-sm font-bold text-slate-700 truncate">{foundPlayer.caddie.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full space-y-3 mb-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Members:</span>
                  {foundPlayer.players.map((p: any) => (
                    <div key={p.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <span className="text-sm font-bold text-slate-700">{p.name}</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">HCP {p.handicap}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleStartGame}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 rounded-[24px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-white"
                >
                  <Play size={20} fill="currentColor" />
                  Start Group Round
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal for Marshal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Trophy size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight mb-2">
                Marshal Access
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-8">
                Please enter the marshal password to access tournament scores.
              </p>
              
              <div className="w-full space-y-4">
                <input
                  type="password"
                  value={marshalPassword}
                  onChange={(e) => setMarshalPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (marshalPassword === '1234') {
                        navigate('../updatemarshallscore');
                      } else {
                        setError('Password Marshal Salah!');
                        setMarshalPassword('');
                        setShowPasswordModal(false);
                      }
                    }
                  }}
                  placeholder="Enter Password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center font-black tracking-[0.3em] text-slate-700 outline-none focus:border-blue-500 transition-all placeholder:tracking-normal placeholder:font-medium"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setMarshalPassword('');
                    }}
                    className="py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => {
                      if (marshalPassword === '1234') {
                      navigate('../updatemarshallscore');
                    } else {
                        setError('Password Marshal Salah!');
                        setMarshalPassword('');
                        setShowPasswordModal(false);
                      }
                    }}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    ACCESS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto pb-8">
        <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] text-center">
          GOLFINITY CONNECT • TOURNAMENT SYSTEM v2.0
        </p>
      </div>
    </div>
  );
};

export default TournamentPlayerSelection;
