import React, { useState, useEffect } from 'react';
import { X, Trophy, Globe, Activity, Users, Calendar, Flag, TrendingUp, Crown, Clock, Lock, Maximize, Minimize } from 'lucide-react';
import ScoreInputModal from './ScoreInputModal';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentName: string;
  players?: any[];
  currentGroupCode?: string;
  currentFlight?: string;
  defaultViewMode?: 'summary' | 'detailed';
  variant?: 'default' | 'marshal' | 'caddie';
}

const LeaderboardModal = ({ isOpen, onClose, tournamentName, players, currentGroupCode, currentFlight, defaultViewMode, variant }: LeaderboardModalProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterMode, setFilterMode] = useState<string>('Overall');
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [chatDraft, setChatDraft] = useState<string>('');
  const [chatTarget, setChatTarget] = useState<string>('all');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; ts: number; to: string; fromRole: string; from: string; text: string }>>([]);
  const [allPlayersData, setAllPlayersData] = useState<any[]>([]);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | number | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'detailed_par'>(defaultViewMode || 'summary');
  const isMarshalVariant = variant === 'marshal';
  const [isMarshalModalOpen, setIsMarshalModalOpen] = useState(false);
  const [marshalPassword, setMarshalPassword] = useState('');
  const [marshalTarget, setMarshalTarget] = useState<{
    groupCode: string;
    playerId: string | number;
    playerName: string;
    holeNumber: number;
    currentScore: number | string | null;
    parValue?: number;
  } | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedScoreData, setSelectedScoreData] = useState<{
    groupCode: string;
    playerId: string | number;
    playerName: string;
    holeNumber: number;
    currentScore: number | string | null;
    parValue?: number;
  } | null>(null);

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

  const ensureNineArray = <T,>(value: any, fillValue: T): T[] => {
    const next = Array.isArray(value) ? value.slice(0, 9) : [];
    while (next.length < 9) next.push(fillValue);
    return next as T[];
  };

  const normalizePlayerForLeaderboard = (player: any) => {
    const scores = player?.scores || {};
    const approvals = player?.approvals || {};
    const marshalEdited = player?.marshalEdited || {};

    return {
      ...player,
      scores: {
        IN: ensureNineArray(scores?.IN, 0),
        OUT: ensureNineArray(scores?.OUT, 0)
      },
      approvals: {
        IN: ensureNineArray(approvals?.IN, false),
        OUT: ensureNineArray(approvals?.OUT, false)
      },
      marshalEdited: {
        IN: ensureNineArray(marshalEdited?.IN, false),
        OUT: ensureNineArray(marshalEdited?.OUT, false)
      },
      manualTotal: player?.manualTotal ?? null
    };
  };

  const fetchChatMessages = async () => {
    try {
      // @ts-ignore
      const { default: api } = await import('../services/api');
      const res = await api.get('/tournaments/chat');
      if (Array.isArray(res.data)) {
        const sorted = res.data.sort((a: any, b: any) => a.ts - b.ts);
        setChatMessages(prev => {
          // If we have more messages than before, play sound or show notice if it's not our own message
          if (sorted.length > prev.length && prev.length > 0) {
            const newMsgs = sorted.slice(prev.length);
            const hasNewFromOthers = newMsgs.some((m: any) => m.fromRole !== 'marshal');
            if (hasNewFromOthers) {
              // Show notice
              // You can optionally add a sound effect here
              // new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed', e));
              const event = new CustomEvent('marshal_new_message');
              window.dispatchEvent(event);
            }
          }
          return sorted;
        });
      }
    } catch {
      setChatMessages([]);
    }
  };

  const appendChatMessage = async (payload: { to: string; text: string }) => {
    const text = payload.text.trim();
    if (!text) return;

    // Optimistic UI Update
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      ts: Date.now(),
      to: payload.to,
      fromRole: 'marshal',
      from: 'MARSHAL',
      text
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatDraft('');

    try {
      // @ts-ignore
      const { default: api } = await import('../services/api');
      await api.post('/tournaments/chat', {
        to: payload.to,
        fromRole: 'marshal',
        from: 'MARSHAL',
        text
      });
    } catch {}
    fetchChatMessages();
  };

  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    const handleNewMessage = () => {
      setHasNewMessage(true);
      setTimeout(() => setHasNewMessage(false), 5000); // Hide after 5 seconds
    };
    window.addEventListener('marshal_new_message', handleNewMessage);
    return () => window.removeEventListener('marshal_new_message', handleNewMessage);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setViewMode(defaultViewMode || 'summary');
    setIsMarshalModalOpen(false);
    setMarshalPassword('');
    setMarshalTarget(null);
    setIsScoreModalOpen(false);
    setSelectedScoreData(null);
    setPlayerSearch('');
    setChatDraft('');
  }, [isOpen, defaultViewMode]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isMarshalVariant) return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 2000);
    return () => clearInterval(interval);
  }, [isOpen, isMarshalVariant]);

  const openMarshalAuth = (player: any, holeNumber: number, currentScore: number | string | null, parValue?: number) => {
    if (!isMarshalVariant) return;
    const groupCode = (player?.groupCode || '').toString();
    if (!groupCode) return;
    setMarshalTarget({
      groupCode,
      playerId: player.id,
      playerName: player.name,
      holeNumber,
      currentScore,
      parValue
    });
    setMarshalPassword('');
    setIsMarshalModalOpen(true);
  };

  const syncToApi = async (flightCode: string, updatedPlayers: any[]) => {
    try {
      // @ts-ignore
      const { default: api } = await import('../services/api');
      await api.post('/tournaments/sync-scores', {
        flightCode,
        players: updatedPlayers
      });
    } catch (err) {
      console.error('Failed to sync marshal score update to API:', err);
    }
  };

  const applyMarshalScoreUpdate = (payload: {
    groupCode: string;
    playerId: string | number;
    playerName: string;
    holeNumber: number;
    newScore: number | string | null;
  }) => {
    const { groupCode, playerId, playerName, holeNumber, newScore } = payload;
    const storageKey = `tournament_scores_${groupCode}`;
    const scoresStr = localStorage.getItem(storageKey);
    let groupPlayers: any[] = [];
    if (scoresStr) {
      try {
        const parsed = JSON.parse(scoresStr);
        if (Array.isArray(parsed)) groupPlayers = parsed;
      } catch {}
    }

    if (!groupPlayers.length) {
      try {
        const savedTournament = localStorage.getItem('active_tournament');
        if (savedTournament) {
          const tournamentData = JSON.parse(savedTournament);
          const group = (tournamentData.groups || []).find((g: any) => g.code === groupCode);
          if (group?.players && Array.isArray(group.players)) groupPlayers = group.players;
        }
      } catch {}
    }

    if (!groupPlayers.length) return;

    const playerIdx =
      groupPlayers.findIndex((p: any) => p?.id === playerId) !== -1
        ? groupPlayers.findIndex((p: any) => p?.id === playerId)
        : groupPlayers.findIndex((p: any) => (p?.name || '').toString().toUpperCase() === playerName.toString().toUpperCase());

    if (playerIdx === -1) return;

    const activeNine = holeNumber <= 9 ? 'IN' : 'OUT';
    const holeIndex = holeNumber <= 9 ? holeNumber - 1 : holeNumber - 10;

    const nextPlayers = groupPlayers.map((p: any, idx: number) => {
      if (idx !== playerIdx) return p;
      const scores = p.scores || { IN: Array(9).fill(0), OUT: Array(9).fill(0) };
      const nextScores = {
        IN: Array.isArray(scores.IN) ? [...scores.IN] : Array(9).fill(0),
        OUT: Array.isArray(scores.OUT) ? [...scores.OUT] : Array(9).fill(0)
      };
      nextScores[activeNine][holeIndex] = newScore;

      const approvals = p.approvals || { IN: Array(9).fill(false), OUT: Array(9).fill(false) };
      const nextApprovals = {
        IN: Array.isArray(approvals.IN) ? [...approvals.IN] : Array(9).fill(false),
        OUT: Array.isArray(approvals.OUT) ? [...approvals.OUT] : Array(9).fill(false)
      };
      nextApprovals[activeNine][holeIndex] = true;

      const marshalEdited = p.marshalEdited || { IN: Array(9).fill(false), OUT: Array(9).fill(false) };
      const nextMarshalEdited = {
        IN: Array.isArray(marshalEdited.IN) ? [...marshalEdited.IN] : Array(9).fill(false),
        OUT: Array.isArray(marshalEdited.OUT) ? [...marshalEdited.OUT] : Array(9).fill(false)
      };
      nextMarshalEdited[activeNine][holeIndex] = true;

      return { ...p, scores: nextScores, approvals: nextApprovals, marshalEdited: nextMarshalEdited };
    });

    localStorage.setItem(storageKey, JSON.stringify(nextPlayers));
    syncToApi(groupCode, nextPlayers);

    setAllPlayersData(prev =>
      prev.map((p: any) => {
        if (p?.groupCode !== groupCode) return p;
        if (p?.id !== playerId && (p?.name || '').toString().toUpperCase() !== playerName.toString().toUpperCase()) return p;
        const scores = p.scores || { IN: Array(9).fill(0), OUT: Array(9).fill(0) };
        const nextScores = {
          IN: Array.isArray(scores.IN) ? [...scores.IN] : Array(9).fill(0),
          OUT: Array.isArray(scores.OUT) ? [...scores.OUT] : Array(9).fill(0)
        };
        nextScores[activeNine][holeIndex] = newScore;
        const approvals = p.approvals || { IN: Array(9).fill(false), OUT: Array(9).fill(false) };
        const nextApprovals = {
          IN: Array.isArray(approvals.IN) ? [...approvals.IN] : Array(9).fill(false),
          OUT: Array.isArray(approvals.OUT) ? [...approvals.OUT] : Array(9).fill(false)
        };
        nextApprovals[activeNine][holeIndex] = true;

        const marshalEdited = p.marshalEdited || { IN: Array(9).fill(false), OUT: Array(9).fill(false) };
        const nextMarshalEdited = {
          IN: Array.isArray(marshalEdited.IN) ? [...marshalEdited.IN] : Array(9).fill(false),
          OUT: Array.isArray(marshalEdited.OUT) ? [...marshalEdited.OUT] : Array(9).fill(false)
        };
        nextMarshalEdited[activeNine][holeIndex] = true;

        return { ...p, scores: nextScores, approvals: nextApprovals, marshalEdited: nextMarshalEdited };
      })
    );
  };

  const handleMarshalAuth = () => {
    if (marshalPassword === '1234') {
      setIsMarshalModalOpen(false);
      setMarshalPassword('');
      if (marshalTarget) {
        setSelectedScoreData({
          groupCode: marshalTarget.groupCode,
          playerId: marshalTarget.playerId,
          playerName: marshalTarget.playerName,
          holeNumber: marshalTarget.holeNumber,
          currentScore: marshalTarget.currentScore,
          parValue: marshalTarget.parValue
        });
        setIsScoreModalOpen(true);
      }
    } else {
      alert('Password Marshal Salah!');
      setMarshalPassword('');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchLatestData = async () => {
      if (variant === 'caddie') return;
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
      if (variant === 'caddie') {
        if (players) setAllPlayersData(players);
        return;
      }
      const savedTournament = localStorage.getItem('active_tournament');
      if (!savedTournament) {
        if (players) setAllPlayersData(players);
        return;
      }
      const tournamentData = JSON.parse(savedTournament);
      const dbGroups = tournamentData.groups || [];
      
      const collectedPlayers: any[] = [];

      dbGroups.forEach((group: any) => {
        const groupScoresStr = localStorage.getItem(`tournament_scores_${group.code}`);
        let groupPlayers = group.players || [];
        
        if (groupScoresStr) {
           const parsedScores = JSON.parse(groupScoresStr);
           groupPlayers = Array.isArray(parsedScores) ? parsedScores.map(normalizePlayerForLeaderboard) : [];
        } else {
           groupPlayers = groupPlayers.map(normalizePlayerForLeaderboard);
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
  }, [isOpen, players]);

  if (!isOpen) return null;

  const visibleChatMessages = isMarshalVariant
    ? chatMessages
        .filter((m) => m?.to === 'marshal' || m?.to === 'all')
        .slice()
        .sort((a, b) => (a?.ts || 0) - (b?.ts || 0))
    : [];

  const getRelativeScore = (player: any) => {
    if (!player.scores) return '0';

    let totalPar = 0;
    let totalStrokes = 0;

    if (player.scores.IN) {
      player.scores.IN.forEach((score: any, idx: number) => {
        const isApproved = player.approvals?.IN?.[idx] || player.marshalEdited?.IN?.[idx];
        if (isApproved && typeof score === 'number' && score > 0 && holeData.IN[idx]) {
          totalStrokes += score;
          totalPar += holeData.IN[idx].par;
        }
      });
    }

    if (player.scores.OUT) {
      player.scores.OUT.forEach((score: any, idx: number) => {
        const isApproved = player.approvals?.OUT?.[idx] || player.marshalEdited?.OUT?.[idx];
        if (isApproved && typeof score === 'number' && score > 0 && holeData.OUT[idx]) {
          totalStrokes += score;
          totalPar += holeData.OUT[idx].par;
        }
      });
    }

    if (totalStrokes === 0) {
      // Fallback to database relative if array is empty
      if (player.relative) {
        return player.relative === 'E' ? '0' : player.relative;
      }
      return '0';
    }
    
    // Calculate Par based only on played (and confirmed) holes
    let diff = 0;
    if (totalStrokes > 0 && totalPar > 0) {
      diff = totalStrokes - totalPar;
    }
    
    return diff > 0 ? `+${diff}` : diff === 0 ? '0' : diff;
  };

  const getTotalScore = (player: any) => {
    if (!player.scores) return player.manualTotal || 0;
    const inTotal = player.scores.IN ? player.scores.IN.reduce((acc: number, curr: any, idx: number) => {
      const isApproved = player.approvals?.IN?.[idx] || player.marshalEdited?.IN?.[idx];
      return acc + (isApproved && typeof curr === 'number' ? curr : 0);
    }, 0) : 0;
    const outTotal = player.scores.OUT ? player.scores.OUT.reduce((acc: number, curr: any, idx: number) => {
      const isApproved = player.approvals?.OUT?.[idx] || player.marshalEdited?.OUT?.[idx];
      return acc + (isApproved && typeof curr === 'number' ? curr : 0);
    }, 0) : 0;
    
    const calculatedTotal = inTotal + outTotal;
    if (calculatedTotal === 0 && player.manualTotal) {
      return player.manualTotal;
    }
    return calculatedTotal;
  };

  const getHoleProgress = (player: any) => {
    if (!player.scores) return 0;
    const inPlayed = player.scores.IN ? player.scores.IN.filter((s: any, idx: number) => {
      const isApproved = player.approvals?.IN?.[idx] || player.marshalEdited?.IN?.[idx];
      return isApproved && typeof s === 'number' && s > 0;
    }).length : 0;
    const outPlayed = player.scores.OUT ? player.scores.OUT.filter((s: any, idx: number) => {
      const isApproved = player.approvals?.OUT?.[idx] || player.marshalEdited?.OUT?.[idx];
      return isApproved && typeof s === 'number' && s > 0;
    }).length : 0;
    return inPlayed + outPlayed;
  };

  const filteredPlayers = allPlayersData.filter(p => {
    if (filterMode === 'OwnFlight') {
      return p.groupCode === currentGroupCode;
    }
    if (filterMode === 'FlightA') return p.flightType === 'A';
    if (filterMode === 'FlightB') return p.flightType === 'B';
    if (filterMode === 'FlightC') return p.flightType === 'C';
    return true; // Overall
  });

  const searchedPlayers = filteredPlayers.filter((p: any) => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return true;
    const name = (p?.name || '').toString().toLowerCase();
    return name.includes(q);
  });

  const isPlayerOut = (player: any) => {
    if (!player.scores) return false;
    const inOut = player.scores.IN ? player.scores.IN.includes('OUT') : false;
    const outOut = player.scores.OUT ? player.scores.OUT.includes('OUT') : false;
    return inOut || outOut;
  };

  const sortedPlayers = [...searchedPlayers]
    .map(p => {
      const relativeScore = getRelativeScore(p);
      const numericRelative = typeof relativeScore === 'number' ? relativeScore : (relativeScore === '0' || relativeScore === 'E' ? 0 : parseInt(relativeScore as string) || 0);
      return {
        ...p,
        grossScore: getTotalScore(p),
        totalHoles: getHoleProgress(p),
        isOut: isPlayerOut(p),
        numericRelative,
        displayRelativeScore: relativeScore
      };
    })
    .sort((a, b) => {
      // Put OUT players at the bottom
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* Modal Container Fullscreen - Deep Navy & Purple Theme */}
      <div className="relative w-full h-full bg-[#000a20] overflow-hidden flex flex-col animate-in fade-in duration-500 font-sans">
        
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-black/40 pointer-events-none" />

        <div className="flex flex-1 w-full h-full overflow-hidden relative z-10">
          {/* Sidebar Left - Orange Panel */}
          <div className="w-[320px] px-4 py-4 md:px-5 lg:px-6 md:pb-6 lg:pb-8 md:pt-4 lg:pt-6 flex flex-col justify-between border-r border-white/10 bg-[#b85a29] shadow-2xl relative z-30 overflow-hidden hidden md:flex shrink-0">
            <div className="flex-1 min-h-0 relative z-10 flex flex-col">
              {isMarshalVariant ? (
                <div className="flex flex-col h-full gap-3 lg:gap-4">
                  <div className="px-1 shrink-0">
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block">CODE MARSHAL :</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden bg-white/10 flex flex-col flex-1 min-h-[250px]">
                    <div className="bg-[#2b5ba4] px-3 py-2.5 lg:py-3 flex items-center justify-between shrink-0 relative">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.2em]">CHAT PANEL</span>
                        {hasNewMessage && (
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 lg:gap-2">
                        <button type="button" className="w-6 h-6 lg:w-7 lg:h-7 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center">
                          <Globe size={12} className="text-white/80" />
                        </button>
                        <button type="button" className="w-6 h-6 lg:w-7 lg:h-7 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center">
                          <Calendar size={12} className="text-white/80" />
                        </button>
                        <button type="button" className="w-6 h-6 lg:w-7 lg:h-7 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center">
                          <Flag size={12} className="text-white/80" />
                        </button>
                        <button type="button" className="w-6 h-6 lg:w-7 lg:h-7 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center">
                          <TrendingUp size={12} className="text-white/80" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0a1e1b] p-2.5 lg:p-3 flex-1 flex flex-col min-h-0">
                      <div className="flex-1 overflow-y-auto custom-scrollbar-dark space-y-2 pr-2 pb-2 flex flex-col-reverse">
                        {visibleChatMessages.length ? (
                          <div className="space-y-2 flex flex-col">
                            {visibleChatMessages.map((m) => {
                              const isOut = m.fromRole === 'marshal';
                              const senderName = m.from || (isOut ? 'MARSHAL' : 'CADDIE');
                              return (
                                <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] lg:text-[12px] font-bold ${
                                    isOut
                                      ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/20'
                                      : 'bg-white/10 text-white/90 border border-white/10'
                                  }`}>
                                    {!isOut && <div className="text-[8px] lg:text-[9px] font-black text-[#ff7b5a] mb-0.5">{senderName}</div>}
                                    {m.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">No messages</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 lg:mt-3 flex flex-col gap-2 shrink-0">
                        <textarea
                          value={chatDraft}
                          onChange={(e) => setChatDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              appendChatMessage({ to: chatTarget, text: chatDraft });
                            }
                          }}
                          placeholder={chatTarget === 'all' ? "Kirim ke Semua..." : `Kirim ke ${chatTarget}...`}
                          className="w-full min-h-[40px] max-h-[60px] lg:min-h-[50px] lg:max-h-[80px] rounded-xl bg-black/20 border border-white/10 text-white/90 p-2.5 lg:p-3 text-[11px] lg:text-[12px] font-bold outline-none focus:border-white/20 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select
                              value={chatTarget}
                              onChange={(e) => setChatTarget(e.target.value)}
                              className="h-9 lg:h-10 bg-black/40 text-white/90 border border-white/20 rounded-xl px-3 outline-none focus:border-[#ff7b5a] appearance-none font-bold text-[10px] lg:text-[11px] cursor-pointer hover:bg-black/60 pr-8 w-full"
                            >
                              <option value="all">Semua Group</option>
                              {Array.from(new Set(chatMessages.filter(m => m.to === 'marshal' && m.from).map(m => m.from))).map(flight => (
                                <option key={flight} value={flight}>{flight}</option>
                              ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 6.5L6 1.5L11 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"/>
                              </svg>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              appendChatMessage({ to: chatTarget, text: chatDraft });
                            }}
                            className="h-9 lg:h-10 px-5 lg:px-6 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-rose-600/25 shrink-0"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="lg:w-[18px] lg:h-[18px]">
                              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 lg:p-4 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1.5 lg:space-y-2 shrink-0">
                    <span className="text-[10px] lg:text-[11px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1.5 lg:mb-2">Filter Klasemen</span>
                    <div className="relative">
                      <select 
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value as any)}
                        className="w-full bg-black/40 text-white/90 border border-white/20 rounded-xl py-2.5 lg:py-3 px-3 lg:px-4 outline-none focus:border-[#ff7b5a] transition-all appearance-none font-bold text-xs lg:text-sm cursor-pointer hover:bg-black/60"
                      >
                        <option value="Overall">1. All Players</option>
                        {!isMarshalVariant && currentGroupCode && <option value="OwnFlight">2. Own Flight</option>}
                        <option value="FlightA">3. Flight A</option>
                        <option value="FlightB">4. Flight B</option>
                        <option value="FlightC">5. Flight C</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-3 lg:h-2">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4 shrink-0">
                    <div className="bg-white/10 p-3 lg:p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                      <span className="text-[9px] lg:text-[10px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1.5 lg:mb-2">Total Players</span>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl lg:text-4xl font-black italic text-white leading-none drop-shadow-xl">{sortedPlayers.length}</span>
                        <Users size={20} className="text-white/30 lg:w-6 lg:h-6" />
                      </div>
                    </div>

                    <div className="bg-white/10 p-3 lg:p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col justify-center overflow-hidden">
                      <span className="text-[9px] lg:text-[10px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1.5 lg:mb-2">Current Leader</span>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Trophy size={20} className="text-amber-300 shrink-0 lg:w-6 lg:h-6" />
                        <span className="text-sm lg:text-base font-black text-white uppercase italic truncate drop-shadow-md">{sortedPlayers[0]?.name || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                      <div className="text-[10px] lg:text-xs font-bold text-white/80 uppercase tracking-widest italic">Tournament</div>
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
                          {!isMarshalVariant && currentGroupCode && <option value="OwnFlight">2. Own Flight</option>}
                          <option value="FlightA">3. Flight A</option>
                          <option value="FlightB">4. Flight B</option>
                          <option value="FlightC">5. Flight C</option>
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
              )}
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
                {isMarshalVariant
                  ? (viewMode === 'summary' ? 'DETAILED SCORE' : viewMode === 'detailed' ? 'DETAILED PAR' : 'SUMMARY SCORE')
                  : (viewMode === 'summary' ? 'Detailed Score' : viewMode === 'detailed' ? 'Detailed Par' : 'Summary Score')}
              </button>
            </div>
            
            {/* Footer Text */}
            {!isMarshalVariant && (
              <div className="absolute -bottom-16 left-0 right-0 p-8 text-[#8c4015] text-[10px] leading-tight opacity-80 pointer-events-none">
                The content of this presentation is considered confidential. If you wish<br/>to forward it to an unintended recipient, kindly proceed with confirmation.
              </div>
            )}
          </div>

          {/* Leaderboard Main Display - Deep Green */}
          <div className="flex-1 flex flex-col p-0 bg-[#0f2824] relative z-20">
              {/* Header - Fixed to top of table */}
              <div className="bg-[#14342d] px-6 py-4 flex justify-between items-center shrink-0 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <img src="/logo1.png" alt="Logo" className="h-6 w-auto object-contain brightness-0 invert" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-white">GolfinityConnect</span>
                </div>
                <div className="flex items-center gap-4">
                  {viewMode === 'detailed' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-black text-white/90 tracking-wide">Search Player</span>
                      <input
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        className="h-7 w-40 bg-white text-[#0f2824] rounded-sm px-2 text-[12px] font-bold outline-none"
                      />
                    </div>
                  )}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all shadow-sm"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize size={16} className="text-white/80" /> : <Maximize size={16} className="text-white/80" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center bg-[#2b5ba4] hover:bg-[#3a6bb8] rounded-lg transition-all"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
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
                    const relativeScore = player.displayRelativeScore;
                    return (
                      <React.Fragment key={`top-${player.id || idx}`}>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPlayerId(expandedPlayerId === (player.id || idx) ? null : (player.id || idx));
                          }}
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
                          <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-black rounded border border-white/20 uppercase tracking-widest">
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
                        <span className={`text-3xl font-black italic tracking-tighter ${player.isOut ? 'text-orange-400/30' : (typeof relativeScore === 'string' && relativeScore.startsWith('-')) || (typeof relativeScore === 'number' && relativeScore < 0) ? 'text-[#ff7b5a] drop-shadow-[0_0_10px_rgba(255,123,90,0.3)]' : (typeof relativeScore === 'string' && relativeScore.startsWith('+')) || (typeof relativeScore === 'number' && relativeScore > 0) ? 'text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-white'}`}>
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

                    {/* Expanded Score Detail - Floating Popup */}
                    {expandedPlayerId === (player.id || idx) && (
                      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPlayerId(null);
                        }} />
                        <div 
                          className="relative bg-[#0f2824]/95 backdrop-blur-xl border border-[#ff7b5a]/30 p-8 rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                          style={{
                            width: '100%',
                            maxWidth: '1000px',
                            boxShadow: '0 0 50px rgba(184, 90, 41, 0.2)'
                          }}
                        >
                          {/* Close button & Header for popup */}
                          <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] text-[#ff7b5a] font-black uppercase tracking-widest mb-1.5">Rank</span>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg ${player.isOut ? 'bg-[#b85a29]/50 border-[#ff7b5a]/50 text-[#ff7b5a]/50' : 'bg-[#14342d] border-[#ff7b5a] text-white shadow-[#ff7b5a]/20'}`}>
                                  <span className="text-3xl font-black italic">{player.isOut ? '-' : idx + 1}</span>
                                </div>
                              </div>
                              <div className="flex flex-col justify-end h-full pt-4">
                                <div className="flex items-center gap-4">
                                  <h3 className="text-4xl font-black text-white italic tracking-tight">{player.name}</h3>
                                  {player.isOut && (
                                     <span className="px-3 py-1 bg-[#ff7b5a]/20 text-[#ff7b5a] text-sm font-black rounded-lg border border-[#ff7b5a]/30 uppercase tracking-widest">
                                       NR
                                     </span>
                                   )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPlayerId(null);
                              }}
                              className="w-12 h-12 bg-white/5 hover:bg-rose-500/80 rounded-2xl flex items-center justify-center transition-all group"
                            >
                              <X size={24} className="text-white/70 group-hover:text-white" />
                            </button>
                          </div>

                        <div className="space-y-8">
                          {/* IN Holes */}
                          <div>
                            <h4 className="text-[#ff7b5a] text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#ff7b5a]"></div>
                              SCORE DETAIL (Hole 1-18)
                            </h4>
                            <div className="grid grid-cols-9 gap-3">
                              {[...holeData.IN, ...holeData.OUT].map((hole, i) => {
                                const scoreArray = i < 9 ? player.scores?.IN : player.scores?.OUT;
                                const scoreIdx = i < 9 ? i : i - 9;
                                const rawScore = scoreArray?.[scoreIdx];
                                const nineKey = i < 9 ? 'IN' : 'OUT';
                                const isApproved = !!player?.approvals?.[nineKey]?.[scoreIdx] || !!player?.marshalEdited?.[nineKey]?.[scoreIdx];
                                const displayScore = (!isApproved || rawScore === 0 || rawScore === null) ? '-' : rawScore === 'OUT' ? 'NR' : rawScore;
                                
                                return (
                                  <div key={hole.num} className="bg-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
                                    <span className="text-[11px] text-white/50 font-bold mb-2">H{hole.num}</span>
                                    <span className="text-2xl xl:text-3xl font-black text-white italic">
                                      {displayScore}
                                    </span>
                                    <span className="text-[10px] text-[#ff7b5a]/60 font-bold mt-2 bg-[#ff7b5a]/10 px-2 py-0.5 rounded-md">P{hole.par}</span>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Summary Totals */}
                            <div className="flex gap-4 mt-6">
                              <div className="flex-1 bg-gradient-to-br from-[#14342d] to-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/30 shadow-[0_0_15px_rgba(255,123,90,0.1)]">
                                <span className="text-[11px] text-[#ff7b5a] font-black mb-1 uppercase tracking-widest">IN (1-9)</span>
                                <span className="text-3xl font-black text-white italic drop-shadow-md">
                                  {player.scores?.IN?.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) || 0}
                                </span>
                              </div>
                              <div className="flex-1 bg-gradient-to-br from-[#14342d] to-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/30 shadow-[0_0_15px_rgba(255,123,90,0.1)]">
                                <span className="text-[11px] text-[#ff7b5a] font-black mb-1 uppercase tracking-widest">OUT (10-18)</span>
                                <span className="text-3xl font-black text-white italic drop-shadow-md">
                                  {player.scores?.OUT?.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) || 0}
                                </span>
                              </div>
                              <div className="flex-1 bg-gradient-to-br from-[#ff7b5a]/20 to-[#b85a29]/20 rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/50 shadow-[0_0_20px_rgba(255,123,90,0.2)]">
                                <span className="text-[11px] text-white font-black mb-1 uppercase tracking-widest">TOTAL</span>
                                <span className="text-4xl font-black text-[#ff7b5a] italic drop-shadow-md">
                                  {getTotalScore(player)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Table Body - Scrollable section for Rank 5+ */}
              <div id="modal-leaderboard-scroll-container" className="flex-1 overflow-y-auto custom-scrollbar-dark relative z-10">
                {sortedPlayers.length > 4 ? (
                  sortedPlayers.slice(4).map((player: any, originalIdx: number) => {
                    const idx = originalIdx + 4;
                    const relativeScore = player.displayRelativeScore;

                    return (
                      <React.Fragment key={player.id || idx}>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPlayerId(expandedPlayerId === (player.id || idx) ? null : (player.id || idx));
                          }}
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
                          <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-black rounded border border-white/20 uppercase tracking-widest">
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
                        <span className={`text-3xl font-black italic tracking-tighter ${player.isOut ? 'text-orange-400/30' : (typeof relativeScore === 'string' && relativeScore.startsWith('-')) || (typeof relativeScore === 'number' && relativeScore < 0) ? 'text-[#ff7b5a] drop-shadow-[0_0_10px_rgba(255,123,90,0.3)]' : (typeof relativeScore === 'string' && relativeScore.startsWith('+')) || (typeof relativeScore === 'number' && relativeScore > 0) ? 'text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-white'}`}>
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

                        {/* Expanded Score Detail - Floating Popup */}
                        {expandedPlayerId === (player.id || idx) && (
                          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPlayerId(null);
                            }} />
                            <div 
                              className="relative bg-[#0f2824]/95 backdrop-blur-xl border border-[#ff7b5a]/30 p-8 rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                              style={{
                                width: '100%',
                                maxWidth: '1000px',
                                boxShadow: '0 0 50px rgba(184, 90, 41, 0.2)'
                              }}
                            >
                              {/* Close button & Header for popup */}
                              <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                                <div className="flex items-center gap-6">
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-[#ff7b5a] font-black uppercase tracking-widest mb-1.5">Rank</span>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg ${player.isOut ? 'bg-[#b85a29]/50 border-[#ff7b5a]/50 text-[#ff7b5a]/50' : 'bg-[#14342d] border-[#ff7b5a] text-white shadow-[#ff7b5a]/20'}`}>
                                      <span className="text-3xl font-black italic">{player.isOut ? '-' : idx + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col justify-end h-full pt-4">
                                    <div className="flex items-center gap-4">
                                      <h3 className="text-4xl font-black text-white italic tracking-tight">{player.name}</h3>
                                      {player.isOut && (
                                        <span className="px-3 py-1 bg-[#ff7b5a]/20 text-[#ff7b5a] text-sm font-black rounded-lg border border-[#ff7b5a]/30 uppercase tracking-widest">
                                          NR
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedPlayerId(null);
                                  }}
                                  className="w-12 h-12 bg-white/5 hover:bg-rose-500/80 rounded-2xl flex items-center justify-center transition-all group"
                                >
                                  <X size={24} className="text-white/70 group-hover:text-white" />
                                </button>
                              </div>

                            <div className="space-y-8">
                              {/* IN Holes */}
                              <div>
                                <h4 className="text-[#ff7b5a] text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#ff7b5a]"></div>
                                  IN (Hole 1-9)
                                </h4>
                                <div className="flex gap-3">
                                  {holeData.IN.map((hole, i) => {
                                    const isApproved = !!player?.approvals?.IN?.[i] || !!player?.marshalEdited?.IN?.[i];
                                    const rawScore = player.scores?.IN?.[i];
                                    
                                    let displayScore: string | number = '-';
                                    if (isApproved && rawScore !== 0 && rawScore !== null) {
                                      if (rawScore === 'OUT') {
                                        displayScore = 'NR';
                                      } else {
                                        if (true) { // Always show detailed par in popup
                                          const diff = rawScore - hole.par;
                                          displayScore = diff > 0 ? `+${diff}` : diff === 0 ? '0' : diff;
                                        }
                                      }
                                    }
                                    
                                    return (
                                    <div key={hole.num} className="flex-1 bg-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
                                      <span className="text-[11px] text-white/50 font-bold mb-2">H{hole.num}</span>
                                      <span className={`text-3xl font-black italic ${(typeof displayScore === 'string' && displayScore.startsWith('+')) ? 'text-[#3b82f6]' : (typeof displayScore === 'number' && displayScore < 0) ? 'text-[#ff7b5a]' : 'text-white'}`}>
                                        {displayScore === 0 ? '0' : displayScore}
                                      </span>
                                      <span className="text-[10px] text-[#ff7b5a]/60 font-bold mt-2 bg-[#ff7b5a]/10 px-2 py-0.5 rounded-md">P{hole.par}</span>
                                    </div>
                                  )})}
                                  <div className="flex-1 bg-gradient-to-br from-[#14342d] to-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/30 shadow-[0_0_15px_rgba(255,123,90,0.1)]">
                                    <span className="text-[11px] text-[#ff7b5a] font-black mb-1 uppercase tracking-widest">IN</span>
                                    <span className="text-3xl font-black text-white italic drop-shadow-md">
                                      {true
                                        ? player.scores?.IN?.reduce((acc: number, curr: any, i: number) => acc + ((typeof curr === 'number' && curr > 0) ? (curr - holeData.IN[i].par) : 0), 0) > 0 
                                          ? `+${player.scores?.IN?.reduce((acc: number, curr: any, i: number) => acc + ((typeof curr === 'number' && curr > 0) ? (curr - holeData.IN[i].par) : 0), 0)}` 
                                          : player.scores?.IN?.reduce((acc: number, curr: any, i: number) => acc + ((typeof curr === 'number' && curr > 0) ? (curr - holeData.IN[i].par) : 0), 0)
                                        : player.scores?.IN?.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* OUT Holes */}
                              <div>
                                <h4 className="text-[#ff7b5a] text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#ff7b5a]"></div>
                                  OUT (Hole 10-18)
                                </h4>
                                <div className="flex gap-3">
                                  {holeData.OUT.map((hole, i) => {
                                    const isApproved = !!player?.approvals?.OUT?.[i] || !!player?.marshalEdited?.OUT?.[i];
                                    const rawScore = player.scores?.OUT?.[i];
                                    
                                    let displayScore: string | number = '-';
                                    if (isApproved && rawScore !== 0 && rawScore !== null) {
                                      if (rawScore === 'OUT') {
                                        displayScore = 'NR';
                                      } else {
                                        if (true) {
                                          const diff = rawScore - hole.par;
                                          displayScore = diff > 0 ? `+${diff}` : diff === 0 ? '0' : diff;
                                        } else {
                                          displayScore = rawScore;
                                        }
                                      }
                                    }
                                    
                                    return (
                                    <div key={hole.num} className="flex-1 bg-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
                                      <span className="text-[11px] text-white/50 font-bold mb-2">H{hole.num}</span>
                                      <span className={`text-3xl font-black italic ${(typeof displayScore === 'string' && displayScore.startsWith('+')) ? 'text-[#3b82f6]' : (typeof displayScore === 'number' && displayScore < 0) ? 'text-[#ff7b5a]' : 'text-white'}`}>
                                        {displayScore === 0 ? '0' : displayScore}
                                      </span>
                                      <span className="text-[10px] text-[#ff7b5a]/60 font-bold mt-2 bg-[#ff7b5a]/10 px-2 py-0.5 rounded-md">P{hole.par}</span>
                                    </div>
                                  )})}
                                  <div className="flex-1 bg-gradient-to-br from-[#14342d] to-[#0a1e1b] rounded-2xl p-4 flex flex-col items-center justify-center border border-[#ff7b5a]/30 shadow-[0_0_15px_rgba(255,123,90,0.1)]">
                                    <span className="text-[11px] text-[#ff7b5a] font-black mb-1 uppercase tracking-widest">OUT</span>
                                    <span className="text-3xl font-black text-white italic drop-shadow-md">
                                      {true
                                        ? player.scores?.OUT?.reduce((acc: number, curr: any, i: number) => acc + ((typeof curr === 'number' && curr > 0) ? (curr - holeData.OUT[i].par) : 0), 0) > 0 
                                          ? `+${player.scores?.OUT?.reduce((acc: number, curr: any, i: number) => acc + ((typeof curr === 'number' && curr > 0) ? (curr - holeData.OUT[i].par) : 0), 0)}` 
                                          : player.scores?.OUT?.reduce((acc: number, curr: any, i: number) => acc + ((typeof curr === 'number' && curr > 0) ? (curr - holeData.OUT[i].par) : 0), 0)
                                        : player.scores?.OUT?.reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0) || 0}
                                    </span>
                                  </div>
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
                    <span className="text-5xl font-black text-white uppercase tracking-[0.6em] italic">Tournament Sync</span>
                  </div>
                )}
              </div>
                </>
              ) : (
                /* DETAILED VIEW - ALL HOLES FOR ALL PLAYERS */
                <div className="flex flex-col flex-1 overflow-hidden bg-[#0f2824]">
                  {/* Detailed Table Header */}
                  <div className="flex items-center px-4 md:px-6 py-3 bg-[#14342d] border-b border-white/5 shadow-md z-30 shrink-0 min-w-[700px]">
                    <span className="w-8 text-[10px] font-black text-white/70 uppercase tracking-widest text-center">Rank</span>
                    <span className="w-32 md:w-48 lg:w-56 text-[10px] font-black text-white/70 uppercase tracking-widest pl-2">Player</span>
                    <div className="flex-1 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-0.5">
                      {Array.from({length: 18}).map((_, i) => (
                        <span key={i} className="text-[10px] font-black text-white/70 text-center uppercase">{i+1}</span>
                      ))}
                    </div>
                    <span className="w-12 md:w-16 text-[10px] font-black text-[#ff7b5a] uppercase tracking-widest text-center">Tot</span>
                  </div>
                  
                  {/* Detailed Table Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar-dark pb-10 min-w-[700px]">
                    {sortedPlayers.map((player: any, idx: number) => (
                      <div 
                        key={player.id || idx}
                        className={`flex items-center px-4 md:px-6 py-2.5 border-b border-white/5 transition-all
                          ${player.isOut ? 'bg-[#ff7b5a]/5' : ''}
                          ${idx % 2 === 0 ? 'bg-[#0a1e1b]' : 'bg-[#0c2320]'}
                        `}
                      >
                        <div className="w-8 flex items-center justify-center">
                          <span className={`text-sm font-black italic ${player.isOut ? 'text-orange-400/50' : 'text-white/80'}`}>
                            {player.isOut ? '-' : idx + 1}
                          </span>
                        </div>
                        
                        <div className="w-32 md:w-48 lg:w-56 flex items-center gap-2 px-2">
                          <span className={`text-sm font-black uppercase italic tracking-tight truncate ${player.isOut ? 'text-orange-300/50 line-through decoration-orange-500/50' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {player.flightType && (
                            <span className="px-1 py-0.5 bg-white/10 text-white/70 text-[8px] font-black rounded border border-white/20 uppercase tracking-widest shrink-0">
                              FLIGHT {player.flightType}
                            </span>
                          )}
                          {player.isOut && (
                            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-black rounded border border-orange-500/30 uppercase tracking-widest shrink-0">
                              NR
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-0.5">
                          {[...holeData.IN, ...holeData.OUT].map((hole, i) => {
                            const scoreArray = i < 9 ? player.scores?.IN : player.scores?.OUT;
                            const scoreIdx = i < 9 ? i : i - 9;
                            const rawScore = scoreArray?.[scoreIdx];
                            const nineKey = i < 9 ? 'IN' : 'OUT';
                            const isApproved = !!player?.approvals?.[nineKey]?.[scoreIdx];
                            const isMarshalConfirmed = !!player?.marshalEdited?.[nineKey]?.[scoreIdx];
                            const isConfirmed = isApproved || isMarshalConfirmed;
                            
                            let displayScore: string | number = '-';
                            if (isConfirmed && rawScore !== 0 && rawScore !== null) {
                              if (rawScore === 'OUT') {
                                displayScore = 'NR';
                              } else {
                                if (viewMode === 'detailed_par') {
                                  const diff = rawScore - hole.par;
                                  displayScore = diff > 0 ? `+${diff}` : diff === 0 ? '0' : diff;
                                } else {
                                  displayScore = rawScore;
                                }
                              }
                            }
                            
                            const cellColorClass = isMarshalConfirmed
                              ? 'bg-orange-500/25 ring-1 ring-orange-500/30'
                              : isApproved
                                ? 'bg-emerald-500/25 ring-1 ring-emerald-500/30'
                                : '';
                    const textColorClass = isMarshalConfirmed
                      ? 'text-orange-200'
                      : isApproved
                        ? 'text-emerald-200'
                        : displayScore === 'NR'
                          ? 'text-orange-400/50'
                          : viewMode === 'detailed_par' && typeof displayScore === 'string' && displayScore.startsWith('+')
                            ? 'text-[#3b82f6]'
                            : viewMode === 'detailed_par' && typeof displayScore === 'number' && displayScore < 0
                              ? 'text-[#ff7b5a]'
                              : 'text-white';
                    const hoverClass = isMarshalVariant
                      ? (cellColorClass ? 'hover:brightness-110 cursor-pointer' : 'hover:bg-white/10 cursor-pointer')
                      : 'cursor-default';
                            
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  if (!isMarshalVariant) return;
                                  openMarshalAuth(player, hole.num, rawScore ?? null, hole.par);
                                }}
                                className={`flex justify-center items-center rounded-sm transition-colors ${hoverClass} ${cellColorClass}`}
                              >
                                <span className={`text-[12px] font-black italic leading-none ${textColorClass}`}>
                                  {displayScore}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="w-12 md:w-16 flex justify-center items-center pl-2">
                          <span className={`text-lg font-black italic ${player.isOut ? 'text-orange-400/30' : 'text-[#ff7b5a]'}`}>
                            {player.isOut ? '-' : viewMode === 'detailed_par' ? player.displayRelativeScore : getTotalScore(player)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScoreInputModal
        isOpen={isScoreModalOpen && !!selectedScoreData}
        onClose={() => setIsScoreModalOpen(false)}
        playerName={selectedScoreData?.playerName || ''}
        holeNumber={selectedScoreData?.holeNumber || 0}
        currentScore={selectedScoreData?.currentScore ?? null}
        parValue={selectedScoreData?.parValue}
        onSave={(score) => {
          if (!selectedScoreData) return;
          applyMarshalScoreUpdate({
            groupCode: selectedScoreData.groupCode,
            playerId: selectedScoreData.playerId,
            playerName: selectedScoreData.playerName,
            holeNumber: selectedScoreData.holeNumber,
            newScore: score
          });
        }}
      />

      {isMarshalModalOpen && marshalTarget && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setIsMarshalModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="bg-orange-600 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white text-2xl uppercase italic tracking-tight">Otoritas Marshal</h3>
                <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mt-1">Skor ini sudah disetujui pemain</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                <Lock className="text-white" size={24} />
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masukkan Password 4-Digit</span>
                <div className="flex justify-center gap-3 mt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${marshalPassword.length > i ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      {marshalPassword.length > i ? (
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => marshalPassword.length < 4 && setMarshalPassword(prev => prev + num)}
                    className="h-14 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-2xl text-xl font-black text-slate-700 border border-slate-200 shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setMarshalPassword('')}
                  className="h-14 bg-red-50 hover:bg-red-100 active:scale-95 transition-all rounded-2xl text-[12px] font-black text-red-600 border border-red-200 shadow-sm uppercase tracking-widest"
                >
                  Clear
                </button>
                <button
                  onClick={() => marshalPassword.length < 4 && setMarshalPassword(prev => prev + '0')}
                  className="h-14 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-2xl text-xl font-black text-slate-700 border border-slate-200 shadow-sm"
                >
                  0
                </button>
                <button
                  onClick={() => setMarshalPassword(prev => prev.slice(0, -1))}
                  className="h-14 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-2xl flex items-center justify-center text-slate-700 border border-slate-200 shadow-sm"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 12)"/>
                    <path d="M20 4H11L4 12L11 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsMarshalModalOpen(false);
                    setMarshalPassword('');
                  }}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest"
                >
                  Batal
                </button>
                <button
                  onClick={handleMarshalAuth}
                  className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] transition-all rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-600/30"
                >
                  Konfirmasi Marshal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardModal;
