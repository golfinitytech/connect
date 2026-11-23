import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  BarChart3, 
  Trophy,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Delete,
  Maximize,
  MessageCircle
} from 'lucide-react';
import ScoreInputModal from '../components/ScoreInputModal';
import LeaderboardModal from '../components/LeaderboardModal';
import api from '../services/api';
import { LoadingOverlay, PageLoader, Spinner, useAsyncAction } from '../components/ui/Loading';

type Nine = 'IN' | 'OUT';
const nineOf = (hole: number): Nine => (hole <= 9 ? 'IN' : 'OUT');
const idxOf = (hole: number) => (hole - 1) % 9;
const emptySlot = (i: number) => ({
  id: `empty-${i}`,
  name: '-',
  manualTotal: null,
  scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) },
  approvals: { IN: Array(9).fill(false), OUT: Array(9).fill(false) },
  marshalEdited: { IN: Array(9).fill(false), OUT: Array(9).fill(false) },
  versions: { IN: Array(9).fill(0), OUT: Array(9).fill(0) },
});
const padPlayers = (list: any[]) => {
  const out = [...(list || [])];
  while (out.length < 4) out.push(emptySlot(out.length));
  return out;
};
const apiMessage = (err: any, fallback = 'Gagal menyimpan ke server.') => {
  const msg = err?.response?.data?.message;
  if (typeof msg === 'string') return msg;
  if (msg && typeof msg.message === 'string') return msg.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (!err?.response) return 'Tidak ada koneksi ke server. Skor belum tersimpan, coba lagi.';
  return fallback;
};

const TournamentScorecard = () => {
  const navigate = useNavigate();
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeNine, setActiveNine] = useState<'IN' | 'OUT'>('IN');
  const [startHoleNumber, setStartHoleNumber] = useState<number>(1);
  const [isTotalInputMode, setIsTotalInputMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<'control' | 'all' | 'marshal'>('marshal');
  const [chatDraft, setChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; ts: number; to: string; fromRole: string; from: string; text: string }>>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasNewMarshalReply, setHasNewMarshalReply] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatPollingRef = useRef<number | null>(null);
  const [notice, setNotice] = useState<{ message: string; kind: 'info' | 'error' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  
  const [session, setSession] = useState<any>(null);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [serverPars, setServerPars] = useState<number[] | null>(null);
  const pendingSavesRef = useRef(0);
  // Cells (`${playerId}:${hole}`) whose score is being saved: shown with a spinner and locked.
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const markSaving = (key: string, on: boolean) =>
    setSavingCells((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  const marshalPinRef = useRef<string | null>(null);

  // Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [selectedScoreData, setSelectedScoreData] = useState<{
    playerId: string | number;
    playerName: string;
    holeNumber: number;
    currentScore: number | string | null;
    parValue?: number;
    isTotal?: boolean;
  } | null>(null);

  // Modal State for Approval
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalData, setApprovalData] = useState<{
    holeNumber: number;
    players: {
      playerId: string | number;
      playerName: string;
      score: number | string;
    }[];
  } | null>(null);

  // Marshal State
  const [isMarshalModalOpen, setIsMarshalModalOpen] = useState(false);
  const [marshalTarget, setMarshalTarget] = useState<{
    playerId: string | number;
    playerName: string;
    holeNumber: number;
    currentScore: number | string | null;
  } | null>(null);
  const [marshalPassword, setMarshalPassword] = useState('');

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) { /* IE11 */
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) { /* Safari */
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) { /* IE11 */
        (document as any).msExitFullscreen();
      }
    }
  };

  const showNotice = (message: string, kind: 'info' | 'error' = 'info') => {
    setNotice({ message, kind });
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
    };
  }, []);

  // Par and Index data for holes
  const holeData = {
    IN: [
      { num: 1, par: 4, index: 10, distance: 353 },
      { num: 2, par: 3, index: 18, distance: 144 },
      { num: 3, par: 4, index: 2, distance: 328 },
      { num: 4, par: 5, index: 6, distance: 451 },
      { num: 5, par: 4, index: 14, distance: 390 },
      { num: 6, par: 4, index: 12, distance: 313 },
      { num: 7, par: 3, index: 4, distance: 178 },
      { num: 8, par: 4, index: 16, distance: 372 },
      { num: 9, par: 5, index: 8, distance: 451 },
    ],
    OUT: [
      { num: 10, par: 4, index: 9, distance: 361 },
      { num: 11, par: 3, index: 17, distance: 144 },
      { num: 12, par: 4, index: 1, distance: 352 },
      { num: 13, par: 4, index: 5, distance: 305 },
      { num: 14, par: 5, index: 13, distance: 476 },
      { num: 15, par: 4, index: 11, distance: 359 },
      { num: 16, par: 3, index: 15, distance: 150 },
      { num: 17, par: 5, index: 3, distance: 482 },
      { num: 18, par: 4, index: 7, distance: 363 },
    ]
  };

  if (serverPars && serverPars.length === 18) {
    (['IN', 'OUT'] as const).forEach((n) => {
      holeData[n] = holeData[n].map((h) => ({ ...h, par: serverPars[h.num - 1] ?? h.par }));
    });
  }

  const refreshFlight = async (sess: any = session, silent = false) => {
    if (!sess?.tournamentId || !sess?.flight) return;
    try {
      const res = await api.get(`/tournaments/${sess.tournamentId}/flights/${sess.flight}`, { silent });
      if (pendingSavesRef.current > 0) return; // don't overwrite optimistic state mid-save
      const data = res.data;
      setTournamentInfo(data.tournament);
      if (Array.isArray(data.tournament?.pars)) setServerPars(data.tournament.pars);
      // Once the server has a start hole for this flight (first score, or set by admin), it wins.
      const serverStart = Number(data.flight?.startHole);
      if (Number.isInteger(serverStart) && serverStart >= 1 && serverStart <= 18) setStartHoleNumber(serverStart);
      const padded = padPlayers(data.players);
      setPlayers(padded);
      localStorage.setItem(`tournament_scores_${sess.flight}`, JSON.stringify(padded));
    } catch (err) {
      console.warn('Failed to refresh flight scores:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Load session and tournament data (server is the source of truth)
    const sessionData = localStorage.getItem('tournament_session');
    if (!sessionData) {
      navigate('../tournament-selection');
      return;
    }
    const parsedSession = JSON.parse(sessionData);
    if (!parsedSession?.tournamentId || !parsedSession?.flight) {
      // Session from the old flow (before tournament codes) -> start over
      localStorage.removeItem('tournament_session');
      navigate('../tournament-selection');
      return;
    }
    setSession(parsedSession);

    const startHoleKey = `tournament_start_hole_${parsedSession.tournamentId}_${parsedSession.flight}`;
    const savedStartHole = Number(localStorage.getItem(startHoleKey));
    const fallbackStart = Number(parsedSession.startHole) || 1;
    const finalStartHole = Number.isInteger(savedStartHole) && savedStartHole >= 1 && savedStartHole <= 18 ? savedStartHole : fallbackStart;
    setStartHoleNumber(finalStartHole);
    setActiveNine(finalStartHole <= 9 ? 'IN' : 'OUT');

    refreshFlight(parsedSession).catch(() => {
      // Offline fallback: show last known scores (read-only until connection is back)
      const cached = localStorage.getItem(`tournament_scores_${parsedSession.flight}`);
      setPlayers(cached ? JSON.parse(cached) : padPlayers(parsedSession.players || []));
      setTournamentInfo({ name: `Turnamen ${parsedSession.tournamentCode || ''}`, course: '' });
      showNotice('Gagal memuat data dari server. Menampilkan data terakhir.', 'error');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    const groupCode = (session?.flight || '').toString();
    if (!groupCode) return;
    if (!session?.tournamentId) return;
    const startHoleKey = `tournament_start_hole_${session.tournamentId}_${groupCode}`;
    localStorage.setItem(startHoleKey, String(startHoleNumber));
  }, [session?.flight, session?.tournamentId, startHoleNumber]);

  // Focus effect for chat
  useEffect(() => {
    if (isChatOpen) {
      setUnreadMessages(0);
      setHasNewMarshalReply(false);
      // Timeout needed to ensure DOM is ready before scrolling
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isChatOpen, chatMessages]);

  // Poll for tournament score changes to keep tablet in sync with marshal edits
  useEffect(() => {
    if (!session || !session.flight) return;
    
    const fetchLatestScores = () => {
      refreshFlight(session, true).catch(() => { /* silent while polling */ });
    };

    const scoreInterval = window.setInterval(fetchLatestScores, 3000);
    return () => window.clearInterval(scoreInterval);
  }, [session]);

  const fetchChatMessages = async () => {
    try {
      if (!session?.tournamentId) return;
      const res = await api.get(`/tournaments/${session.tournamentId}/messages`, { silent: true });
      
      let newMessagesArray = [];
      if (res.data?.success) {
        newMessagesArray = res.data.data || [];
      } else if (Array.isArray(res.data)) {
        newMessagesArray = res.data;
      }

      if (newMessagesArray.length > 0) {
        const sorted = newMessagesArray.sort((a: any, b: any) => a.ts - b.ts);
        setChatMessages((prev) => {
          // If the length is completely different, we might be reloading from scratch
          // Don't trigger "new message" logic if it's the first time loading (prev.length === 0)
          if (sorted.length > prev.length && prev.length > 0) {
            const newMessages = sorted.slice(prev.length);
            
            // Check if there's a new message from Marshal specifically for this flight
            const myFlight = session?.flight ? `FLIGHT ${session.flight}` : '';
            const newMarshalReply = newMessages.some((m: any) => 
              m.fromRole === 'marshal' && (m.to === myFlight || m.to === 'all')
            );
            
            if (!isChatOpen) {
              setUnreadMessages(prevUnread => prevUnread + newMessages.length);
              if (newMarshalReply) {
                setHasNewMarshalReply(true);
                // Trigger visual notification bell or alert
                showNotice('Pesan baru dari Marshal!', 'info');
              }
            }
          }
          return sorted;
        });
      }
    } catch (err) {
      console.warn("Failed to fetch chat messages:", err);
    }
  };

  useEffect(() => {
    // Need to have initialized session before fetching chat messages
    if (!session) return;
    
    // Initial fetch
    fetchChatMessages();
    
    // Poll every 2 seconds
    const intervalId = window.setInterval(fetchChatMessages, 2000);
    chatPollingRef.current = intervalId;
    
    return () => {
      if (chatPollingRef.current) {
        window.clearInterval(chatPollingRef.current);
        chatPollingRef.current = null;
      }
    };
  }, [session]);

  const appendChatMessage = async (payload: { to: 'control' | 'all' | 'marshal'; text: string }) => {
    const text = payload.text.trim();
    if (!text) return;
    const groupCode = (session?.flight || '').toString();
    const from = groupCode ? `FLIGHT ${groupCode}` : 'CADDIE';
    
    // Optimistic UI Update
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      ts: Date.now(),
      to: payload.to,
      fromRole: 'caddie',
      from,
      text
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatDraft('');
    
    try {
      await api.post(`/tournaments/${session.tournamentId}/messages`, {
        to: payload.to,
        fromRole: 'caddie',
        from,
        groupCode,
        text
      });
    } catch {}
    fetchChatMessages();
  };

  const visibleChatMessages = chatMessages.filter((m) => {
    const myFlight = session?.flight ? `FLIGHT ${session.flight}` : '';
    
    if (chatRecipient === 'marshal') {
      return (m.to === 'marshal' && m.from === myFlight) || 
             (m.fromRole === 'marshal' && m.to === myFlight) ||
             (m.fromRole === 'marshal' && m.to === 'all');
    }
    
    if (chatRecipient === 'control') {
      return (m.to === 'control' && m.from === myFlight) || 
             (m.fromRole === 'admin' && m.to === myFlight) ||
             (m.fromRole === 'admin' && m.to === 'all');
    }
    
    if (chatRecipient === 'all') {
      return m.to === 'all';
    }
    
    return false;
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.round(battery.level * 100)));
      }
    };
    getBatteryStatus();
  }, []);

  const calculateTotal = (playerScores: (number | string | null)[]) => {
    return playerScores.reduce((acc: number, curr) => {
      if (typeof curr === 'number') {
        return acc + curr;
      }
      return acc;
    }, 0);
  };

  const getPlayerStats = (player: any) => {
    if (isTotalInputMode && player.manualTotal !== null) {
      return { in: 0, out: 0, total: player.manualTotal };
    }
    
    // Safely check if scores exists and has IN/OUT properties
    const inScores = player?.scores?.IN || Array(9).fill(0);
    const outScores = player?.scores?.OUT || Array(9).fill(0);
    
    const inTotal = calculateTotal(inScores);
    const outTotal = calculateTotal(outScores);
    return { in: inTotal, out: outTotal, total: (inTotal as number) + (outTotal as number) };
  };

  const notifyAdmin = async (changedHole: number, changedPlayerName: string, newScore: number | string, isApproved: boolean, isMarshalEdit: boolean) => {
    try {
      // @ts-ignore
      const { default: api } = await import('../services/api');
      
      let roleInfo = 'Caddie';
      if (isMarshalEdit) {
        roleInfo = 'Marshal';
      } else if (session?.caddie) {
        roleInfo = `Caddie ${session.caddie.name !== 'Unassigned' ? session.caddie.name : `No.${session.caddie.number}`}`;
      }

      if (isApproved && !isMarshalEdit) {
        await api.put('/admin-notifications/approve', {
          changedHole,
          changedPlayerName,
          isApproved: true
        }, { silent: true });
      } else {
        await api.post('/admin-notifications', {
          roleInfo,
          changedHole,
          changedPlayerName,
          newScore: newScore === 'OUT' ? 0 : newScore,
          isApproved,
          isMarshalEdit,
          groupCode: session?.flight || 'Unknown'
        }, { silent: true });
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  // ── Hole sequence (same rules as the server) ────────────────────────────────
  // Holes are played in order from the start hole (6 -> 6..18, 1..5). A hole is done when
  // every player's score is confirmed (player approval / marshal) or OUT; only the first
  // hole that is not done can be scored.
  const activeRoster = players.filter((p) => p.name !== '-' && !String(p.id).startsWith('empty-'));
  const cellOf = (p: any, hole: number) => ({
    score: p?.scores?.[nineOf(hole)]?.[idxOf(hole)],
    approved: !!p?.approvals?.[nineOf(hole)]?.[idxOf(hole)],
    marshal: !!p?.marshalEdited?.[nineOf(hole)]?.[idxOf(hole)],
  });
  const holeHasScore = (p: any, hole: number) => {
    const { score } = cellOf(p, hole);
    return score === 'OUT' || (typeof score === 'number' && score > 0);
  };
  const holeDone = (p: any, hole: number) => {
    const c = cellOf(p, hole);
    return c.score === 'OUT' || (holeHasScore(p, hole) && (c.approved || c.marshal));
  };
  const playOrder = Array.from({ length: 18 }, (_, i) => ((startHoleNumber - 1 + i) % 18) + 1);
  const currentHole: number | null = activeRoster.length
    ? playOrder.find((h) => !activeRoster.every((p) => holeDone(p, h))) ?? null
    : null;
  const hasAnyProgress = activeRoster.some((p) => playOrder.some((h) => holeHasScore(p, h)));
  const isHoleLocked = (hole: number) => currentHole !== null && hole !== currentHole && !activeRoster.every((p) => holeDone(p, hole));

  // Follow the flight onto the next nine when it moves there.
  useEffect(() => {
    if (currentHole !== null) setActiveNine(nineOf(currentHole));
  }, [currentHole]);

  const handleScoreClick = (player: any, holeNum: number, currentScore: number | null) => {
    if (isTotalInputMode || player.name === '-') return;
    if (savingCells.has(`${player.id}:${holeNum}`)) return; // previous save for this cell still running

    if (!hasAnyProgress && holeNum !== startHoleNumber) {
      showNotice(`Start hole flight ini: ${startHoleNumber}. Kalau salah, ubah di pilihan START HOLE di atas.`, 'error');
      return;
    }

    // Check if score is already approved
    const holeIndex = holeData[activeNine].findIndex(h => h.num === holeNum);
    const isApproved = player.approvals[activeNine][holeIndex];

    if (isApproved) {
      // Trigger Marshal Auth
      setMarshalTarget({
        playerId: player.id,
        playerName: player.name,
        holeNumber: holeNum,
        currentScore: currentScore
      });
      setIsMarshalModalOpen(true);
      return;
    }

    if (currentHole !== null && holeNum !== currentHole) {
      showNotice(`Hole ${holeNum} terkunci. Isi & konfirmasi skor hole ${currentHole} dulu.`, 'error');
      return;
    }

    setSelectedScoreData({
      playerId: player.id,
      playerName: player.name,
      holeNumber: holeNum,
      currentScore: currentScore,
      parValue: holeData[activeNine][holeIndex]?.par
    });
    setIsScoreModalOpen(true);
  };

  const handleTotalClick = (player: any) => {
    if (player.name === '-') return;
    setSelectedScoreData({
      playerId: player.id,
      playerName: player.name,
      holeNumber: 0,
      currentScore: isTotalInputMode ? player.manualTotal : null,
      isTotal: true
    });
    setIsScoreModalOpen(true);
  };

  const withLocalScore = (p: any, hole: number, value: number | string, approved: boolean, marshal: boolean) => {
    const n = nineOf(hole);
    const i = idxOf(hole);
    const scores = { IN: [...(p.scores?.IN || Array(9).fill(0))], OUT: [...(p.scores?.OUT || Array(9).fill(0))] };
    const approvals = { IN: [...(p.approvals?.IN || Array(9).fill(false))], OUT: [...(p.approvals?.OUT || Array(9).fill(false))] };
    const marshalEdited = { IN: [...(p.marshalEdited?.IN || Array(9).fill(false))], OUT: [...(p.marshalEdited?.OUT || Array(9).fill(false))] };
    scores[n][i] = value;
    approvals[n][i] = approved;
    if (marshal) marshalEdited[n][i] = true;
    return { ...p, scores, approvals, marshalEdited };
  };

  const caddieActorName = () => {
    const c = session?.caddie;
    if (!c) return 'Caddie';
    return c.name && c.name !== 'Unassigned' ? `Caddie ${c.name}` : `Caddie No.${c.number ?? '-'}`;
  };

  const handleSaveScore = async (newScore: number | string | null) => {
    if (!selectedScoreData || !session) return;
    const target = selectedScoreData;
    // Read synchronously: the modal calls onClose (which clears it) right after onSave.
    const marshalPin = marshalPinRef.current;
    marshalPinRef.current = null;

    if (target.isTotal) {
      showNotice('Turnamen wajib input skor per hole. Mode total tidak dipakai.', 'error');
      return;
    }
    const player = players.find((p) => p.id === target.playerId);
    if (!player || String(player.id).startsWith('empty-')) return;

    const hole = target.holeNumber;
    const isOut = newScore === 'OUT';
    const strokes = isOut ? null : typeof newScore === 'number' && newScore > 0 ? newScore : null;
    const n = nineOf(hole);
    const i = idxOf(hole);
    const version = player.versions?.[n]?.[i];
    const actorName = caddieActorName();
    const cellKey = `${player.id}:${hole}`;
    markSaving(cellKey, true);

    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? withLocalScore(p, hole, isOut ? 'OUT' : strokes ?? 0, isOut || !!marshalPin, !!marshalPin) : p,
      ),
    );

    pendingSavesRef.current += 1;
    try {
      const body: any = { playerId: player.id, hole, strokes, out: isOut, groupCode: String(session.flight), actorName, startHole: startHoleNumber };
      if (marshalPin) {
        await api.post(`/tournaments/${session.tournamentId}/scores/marshal-edit`, {
          ...body,
          marshalPin,
          actorName: 'Marshal',
          reason: `Edit oleh marshal (flight ${session.flight})`,
        });
      } else {
        await api.put(`/tournaments/${session.tournamentId}/scores`, {
          ...body,
          ...(version ? { expectedVersion: version } : {}),
        });
      }

      // OUT = player withdraws: the server marks the player's remaining holes OUT.

      if (strokes !== null || isOut) {
        notifyAdmin(hole, player.name, isOut ? 'OUT' : (strokes as number), isOut || !!marshalPin, !!marshalPin);
      }
    } catch (err: any) {
      showNotice(apiMessage(err), 'error');
    } finally {
      pendingSavesRef.current -= 1;
      await refreshFlight(undefined, true).catch(() => {});
      markSaving(cellKey, false);
    }
  };

  const handleMarshalAuthImpl = async () => {
    if (!session?.tournamentId) return;
    try {
      await api.post(`/tournaments/${session.tournamentId}/marshal/verify`, { marshalPin: marshalPassword });
    } catch (err: any) {
      showNotice(apiMessage(err, 'PIN Marshal salah!'), 'error');
      setMarshalPassword('');
      return;
    }
    marshalPinRef.current = marshalPassword;
    setIsMarshalModalOpen(false);
    setMarshalPassword('');
    if (marshalTarget) {
      const holeIndex = holeData[activeNine].findIndex(h => h.num === marshalTarget.holeNumber);
      setSelectedScoreData({
        playerId: marshalTarget.playerId,
        playerName: marshalTarget.playerName,
        holeNumber: marshalTarget.holeNumber,
        currentScore: marshalTarget.currentScore,
        parValue: holeIndex !== -1 ? holeData[activeNine][holeIndex].par : undefined
      });
      setIsScoreModalOpen(true);
    }
  };

  const handleConfirmApprovalImpl = async () => {
    if (!approvalData || !session) return;
    const ids = approvalData.players.map((ap) => ap.playerId).filter((id) => !String(id).startsWith('empty-'));
    const hole = approvalData.holeNumber;
    if (ids.length === 0) {
      setIsApprovalModalOpen(false);
      setApprovalData(null);
      return;
    }

    // Mark a save in flight so polling doesn't overwrite optimistic state, but release it
    // *before* the refresh below (refreshFlight skips while saves are pending).
    pendingSavesRef.current += 1;
    let released = false;
    const release = () => {
      if (!released) {
        released = true;
        pendingSavesRef.current -= 1;
      }
    };
    try {
      await api.post(`/tournaments/${session.tournamentId}/scores/validate`, {
        playerIds: ids,
        holes: [hole],
        validatedBy: approvalData.players.map((ap) => ap.playerName).join(', ').slice(0, 100),
        groupCode: String(session.flight),
      });
      approvalData.players.forEach((ap) => notifyAdmin(hole, ap.playerName, ap.score, true, false));
      release();
      await refreshFlight(undefined, true).catch(() => {});
      setIsApprovalModalOpen(false);
      setApprovalData(null);
      showNotice(`Skor hole ${hole} sudah dikonfirmasi player.`, 'info');
    } catch (err: any) {
      // Keep the modal open so the caddie can retry.
      showNotice(apiMessage(err, 'Gagal konfirmasi skor.'), 'error');
    } finally {
      release();
    }
  };

  const { run: handleMarshalAuth, pending: marshalVerifying } = useAsyncAction(handleMarshalAuthImpl);
  const { run: handleConfirmApproval, pending: approving } = useAsyncAction(handleConfirmApprovalImpl);

  const handleManualConfirmPlayer = () => {
    if (currentHole === null) {
      showNotice('Semua hole sudah dikonfirmasi.', 'info');
      return;
    }
    const missing = activeRoster.filter((p) => !holeHasScore(p, currentHole));
    if (missing.length > 0) {
      showNotice(`Isi skor hole ${currentHole} untuk semua pemain dulu (${missing.map((p) => p.name).join(', ')}).`, 'error');
      return;
    }
    const toConfirm = activeRoster.filter((p) => !holeDone(p, currentHole));
    setApprovalData({
      holeNumber: currentHole,
      players: toConfirm.map((p) => ({
        playerId: p.id,
        playerName: p.name,
        score: cellOf(p, currentHole).score,
      })),
    });
    setIsApprovalModalOpen(true);
  };

  if (!session || !tournamentInfo) {
    return (
      <div className="h-screen bg-[#004741] flex items-center justify-center">
        <PageLoader label="Memuat scorecard..." className="!text-white/80" />
      </div>
    );
  }

  const currentHoles = holeData[activeNine] || holeData['IN'];

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {notice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div
            className={`pointer-events-auto max-w-[92vw] rounded-2xl px-4 py-3 text-[12px] font-black tracking-wide shadow-2xl border ${
              notice.kind === 'error'
                ? 'bg-red-600 text-white border-red-500/70'
                : 'bg-slate-900 text-white border-white/10'
            }`}
          >
            {notice.message}
          </div>
        </div>
      )}
      {savingCells.size > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-xl" role="status" aria-live="polite">
          <Spinner size={14} className="text-emerald-400" />
          Menyimpan skor...
        </div>
      )}
      <LoadingOverlay show={approving} label="Mengonfirmasi skor..." />
      {/* Top Header */}
      <header className="bg-[#004741] text-white flex items-center justify-between px-6 py-3 shrink-0 shadow-lg relative z-10">
        <div className="flex items-center gap-8 h-full">
          <div className="flex flex-col justify-center border-r border-slate-700 pr-8">
             <div className="flex items-center gap-2 mb-0.5">
               <img src="/logo1.png" alt="Logo" className="h-5 w-auto object-contain brightness-0 invert" />
               <h1 className="text-sm font-black italic tracking-tighter uppercase text-white leading-none mt-1">
                 GolfinityConnect
               </h1>
             </div>
             <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1.5 ml-7">
               {tournamentInfo?.name || 'TOURNAMENT'}
             </span>
             <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Flight Code: {session.flight}</span>
                 <span className="text-slate-600">|</span>
                 <span className="text-white">{activeNine}</span>
               </span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">START HOLE :</span>
                <select
                  value={startHoleNumber}
                  disabled={hasAnyProgress}
                  title={hasAnyProgress ? 'Start hole terkunci setelah skor pertama masuk' : 'Pilih start hole flight'}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (!Number.isFinite(next)) return;
                    setStartHoleNumber(next);
                    setActiveNine(next <= 9 ? 'IN' : 'OUT');
                  }}
                  className="h-7 px-2 rounded-lg bg-slate-900/40 border border-white/10 text-white text-[10px] font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} className="bg-slate-900 text-white">
                      {n}
                    </option>
                  ))}
                </select>
               </span>
             </div>
          </div>
          
          <div className="flex gap-2">
            {/* The original hole indicator block has been removed as requested */}
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 ml-4">
            <button 
              onClick={() => setActiveNine('IN')}
              className={`px-6 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${activeNine === 'IN' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              In
            </button>
            <button 
              onClick={() => setActiveNine('OUT')}
              className={`px-6 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${activeNine === 'OUT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Out
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => {
                setIsChatOpen(true);
                setUnreadMessages(0);
                setHasNewMarshalReply(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2b5ba4] hover:bg-[#3a6bb8] text-white rounded-lg transition-colors border border-[#3a6bb8] relative shadow-lg"
            >
              <MessageCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Pesan</span>
              {(unreadMessages > 0 || hasNewMarshalReply) && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-2 ring-[#0a1e1b] animate-bounce">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Total-score mode disabled for tournaments: scores must be recorded per hole for validation & ranking. */}
          <button 
            style={{ display: 'none' }}
            onClick={() => setIsTotalInputMode(!isTotalInputMode)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isTotalInputMode ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
          >
            {isTotalInputMode ? 'MODE: TOTAL SKOR' : 'MODE: HOLE SKOR'}
          </button>

          <div className="flex flex-col items-end border-l border-slate-700 pl-6">
            <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest mb-0.5">GOLFINITYSCORE</span>
            <span className="text-sm font-bold tracking-tight text-slate-400">{tournamentInfo.course}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 ml-2 bg-slate-800/50 hover:bg-slate-700 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white"
          >
            <Maximize size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        
        {/* Hole Numbers Header (Now inside the table area, above input cells) */}
        <div className="sticky top-0 z-20 flex flex-col bg-white border-b-2 border-slate-300 shadow-sm text-[11px] font-black text-slate-600">
          
          {/* Row 1: HOLE */}
          <div className="flex">
            <div className="w-32 shrink-0 p-2 flex items-center justify-start bg-slate-100 pl-4">
              <span className="uppercase tracking-widest text-slate-700 font-black">Hole</span>
            </div>
            
            <div className="flex-1 flex items-center justify-around px-4 bg-slate-50">
              {currentHoles.map((hole) => (
                <div
                  key={`hole-${hole.num}`}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 mx-1 rounded-lg ${hole.num === currentHole ? 'bg-blue-600 text-white' : ''}`}
                >
                  {isHoleLocked(hole.num) && <Lock size={10} className="text-slate-300" />}
                  <span className={`text-base leading-none ${hole.num === currentHole ? 'text-white' : isHoleLocked(hole.num) ? 'text-slate-300' : 'text-slate-800'}`}>{hole.num}</span>
                </div>
              ))}
            </div>

            <div className="w-64 shrink-0 flex items-stretch bg-slate-50">
              <div className="flex-1 flex items-center justify-center bg-blue-50/50">
                <span className="text-slate-800 uppercase tracking-widest">TOTAL</span>
              </div>
            </div>
          </div>

          {/* Row 2: PAR */}
          <div className="flex bg-slate-50">
            <div className="w-32 shrink-0 p-2 flex items-center bg-slate-100 pl-4">
              <span className="uppercase tracking-widest text-slate-700">Par</span>
            </div>
            
            <div className="flex-1 flex items-center justify-around px-4 bg-slate-50">
              {currentHoles.map((hole) => (
                <div key={`par-${hole.num}`} className="flex-1 flex items-center justify-center py-1 mx-1">
                  <span className="text-slate-500">{hole.par}</span>
                </div>
              ))}
            </div>

            <div className="w-64 shrink-0 flex items-stretch bg-slate-50">
              <div className="flex-1 flex items-center justify-center bg-blue-50/50">-</div>
            </div>
          </div>

          {/* Row 3: DISTANCE */}
          <div className="flex bg-slate-50">
            <div className="w-32 shrink-0 p-2 flex items-center bg-slate-100 pl-4">
              <span className="uppercase tracking-widest text-slate-700">Distance</span>
            </div>
            
            <div className="flex-1 flex items-center justify-around px-4 bg-slate-50">
              {currentHoles.map((hole) => (
                <div key={`dist-${hole.num}`} className="flex-1 flex items-center justify-center py-1 mx-1">
                  <span className="text-slate-500">{hole.distance}</span>
                </div>
              ))}
            </div>

            <div className="w-64 shrink-0 flex items-stretch bg-slate-50">
              <div className="flex-1 flex items-center justify-center bg-blue-50/50">-</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {players.map((player, pIdx) => {
            const stats = getPlayerStats(player);
            const activeScores = player?.scores?.[activeNine] || Array(9).fill(0);
            const activeApprovals = player?.approvals?.[activeNine] || Array(9).fill(false);
            const activeMarshalEdits = player?.marshalEdited?.[activeNine] || Array(9).fill(false);
            const isEmpty = player.name === '-';

            return (
              <div key={player.id} className={`flex border-b border-slate-200 min-h-[50px] transition-colors ${pIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                {/* Player Info Section */}
                <div className="w-32 shrink-0 flex items-center border-r border-slate-200 p-2 pl-4 bg-white z-10 shadow-[4px_0_8px_rgba(0,0,0,0.02)]">
                  <span className={`font-black text-sm uppercase tracking-tighter truncate w-full text-left ${isEmpty ? 'text-slate-300' : 'text-slate-800'}`}>
                    {player.name}
                  </span>
                </div>

                {/* Hole Scores Section */}
                <div className="flex-1 flex items-center justify-around px-4">
                  {activeScores.map((score, sIdx) => {
                    const isApproved = activeApprovals[sIdx];
                    const isMarshalEdited = activeMarshalEdits[sIdx];
                    const isSaving = savingCells.has(`${player.id}:${currentHoles[sIdx].num}`);
                    const locked = !isEmpty && isHoleLocked(currentHoles[sIdx].num);
                    return (
                      <div 
                        key={sIdx} 
                        onClick={() => handleScoreClick(player, currentHoles[sIdx].num, score)}
                        aria-busy={isSaving}
                        className={`flex-1 flex flex-col items-center justify-center py-2 border-r border-slate-100 last:border-r-0 transition-all relative ${isTotalInputMode ? 'opacity-10 scale-90' : 'opacity-100'} ${!isEmpty ? (isSaving ? 'cursor-wait rounded mx-1 bg-blue-50/60' : locked ? 'cursor-not-allowed rounded mx-1 opacity-40' : 'cursor-pointer hover:bg-blue-50/50 rounded mx-1') : ''} ${!isEmpty && currentHoles[sIdx].num === currentHole ? 'ring-2 ring-blue-500/40 rounded' : ''} ${isMarshalEdited ? 'bg-orange-50' : isApproved ? 'bg-emerald-50' : ''}`}
                      >
                        {isSaving && (
                          <div className="absolute bottom-0.5 right-0.5">
                            <Spinner size={11} className="text-blue-500" />
                          </div>
                        )}
                        <span className={`text-xl font-black italic tracking-tighter transition-all ${isEmpty ? 'text-slate-100' : score === 0 ? 'text-slate-200' : isMarshalEdited ? 'text-orange-600' : isApproved ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {isEmpty ? '-' : score === 0 ? '-' : score === 'OUT' ? 'NR' : score}
                        </span>
                        {isApproved && !isMarshalEdited && (
                          <div className="absolute top-0 right-0">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                          </div>
                        )}
                        {isMarshalEdited && (
                          <div className="absolute top-0 right-0">
                            <ShieldAlert size={10} className="text-orange-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary Section */}
                <div className="w-64 shrink-0 flex items-center bg-slate-100/30 p-1 border-l border-slate-200">
                  <div 
                    onClick={() => handleTotalClick(player)}
                    className={`flex-1 flex items-center justify-center h-full transition-all shadow-inner ${isEmpty ? 'bg-slate-100' : isTotalInputMode ? 'bg-emerald-600 cursor-pointer hover:bg-emerald-500 shadow-emerald-700/20' : 'bg-blue-600 cursor-pointer hover:bg-blue-500 shadow-blue-700/20'}`}
                  >
                    <span className={`text-2xl font-black italic text-white tracking-tighter`}>
                      {isEmpty ? '-' : stats.total}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="p-4 flex">
            <button 
              onClick={handleManualConfirmPlayer}
              className="px-6 py-2 bg-transparent text-blue-600 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-sm hover:bg-blue-50 active:scale-95 border-2 border-blue-600"
            >
              Confirm Player
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="h-20 bg-[#0f172a] text-white flex items-center justify-between px-8 shrink-0 border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4 h-full">
          <button 
            onClick={() => navigate('../mode-selection')}
            className="flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <Menu size={22} className="text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-500 group-hover:text-white">Menu</span>
          </button>
          
          <div className="w-px h-10 bg-white/10 mx-2" />

          <button 
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <BarChart3 size={22} className="text-blue-500" />
            <span className="font-black uppercase text-[9px] tracking-[0.2em] text-blue-500">Score</span>
          </button>

          <button 
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <Trophy size={22} className="text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-500 group-hover:text-white">Rangking</span>
          </button>

          <div className="w-px h-10 bg-white/10 mx-2" />

          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl hover:bg-white/5 transition-all group"
            title="Pesan / Message"
          >
            <MessageCircle size={22} className="text-blue-500" />
            <span className="font-black uppercase text-[9px] tracking-[0.2em] text-blue-500">Pesan</span>
          </button>
        </div>

        <div className="flex items-center gap-10">
          {/* Time & Battery */}
          <div className="flex items-center gap-6 border-l border-white/10 pl-10 h-12">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Round Time</span>
              <span className="text-2xl font-black italic tracking-tighter text-white">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1 bg-slate-800/50 p-2 rounded-xl border border-white/5">
              <div className="w-3 h-6 rounded-md border border-white/20 relative overflow-hidden bg-black/20">
                <div 
                  className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${batteryLevel > 20 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                  style={{ height: `${batteryLevel}%` }} 
                />
              </div>
              <span className="text-[8px] font-black text-white/40">{batteryLevel}%</span>
            </div>
          </div>

          <button 
            onClick={() => {
              // Clear tournament session explicitly
              localStorage.removeItem('tournament_session');
              // Navigate back to the home menu of the respective location
              navigate('..');
            }}
            className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
          >
            Selesai Ronde
          </button>
        </div>
      </footer>

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        tournamentName={tournamentInfo.name}
        players={players}
        currentGroupCode={session?.flight}
        currentFlight={players.find(p => p.name !== '-')?.flight}
      />

      <ScoreInputModal
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          marshalPinRef.current = null;
        }}
        playerName={selectedScoreData?.playerName || ''}
        holeNumber={selectedScoreData?.holeNumber || 0}
        currentScore={selectedScoreData?.currentScore ?? null}
        parValue={selectedScoreData?.parValue}
        onSave={handleSaveScore}
      />

      {isChatOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-4xl font-black tracking-tight text-slate-900">Pilih Penerima</h3>
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setChatRecipient('control')}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${chatRecipient === 'control' ? 'bg-white shadow-md shadow-slate-200/50 scale-100' : 'hover:bg-slate-200/50 scale-95 opacity-70'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${chatRecipient === 'control' ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                      <ShieldAlert size={16} />
                    </div>
                    <span className={`text-lg font-black tracking-tight ${chatRecipient === 'control' ? 'text-blue-600' : 'text-slate-500'}`}>Pusat Kontrol</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setChatRecipient('all')}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${chatRecipient === 'all' ? 'bg-white shadow-md shadow-slate-200/50 scale-100' : 'hover:bg-slate-200/50 scale-95 opacity-70'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${chatRecipient === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                      <MessageCircle size={16} />
                    </div>
                    <span className={`text-lg font-black tracking-tight ${chatRecipient === 'all' ? 'text-emerald-600' : 'text-slate-500'}`}>Semua Group</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setChatRecipient('marshal')}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${chatRecipient === 'marshal' ? 'bg-white shadow-md shadow-slate-200/50 scale-100' : 'hover:bg-slate-200/50 scale-95 opacity-70'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${chatRecipient === 'marshal' ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                      <Lock size={16} />
                    </div>
                    <span className={`text-lg font-black tracking-tight ${chatRecipient === 'marshal' ? 'text-orange-500' : 'text-slate-500'}`}>Marshal</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                <Delete size={22} className="text-slate-600" />
              </button>
            </div>

            <div className="p-8">
              <div className="border border-slate-200 rounded-[18px] overflow-hidden">
                <div className="bg-sky-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} className="text-white" />
                    <span className="text-white text-[18px] font-black uppercase tracking-widest">CHAT PANEL</span>
                  </div>
                  <div className="flex items-center gap-6 text-white/90">
                    <ShieldAlert size={18} />
                    <Lock size={18} />
                    <Maximize size={18} />
                    <Menu size={18} />
                  </div>
                </div>

                <div className="bg-[#f8fafc] px-6 py-6 relative">
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <img src="/logo1.png" alt="Golfinity" className="w-64 grayscale" />
                  </div>
                  <div className="h-[340px] overflow-y-auto space-y-4 pr-2 relative z-10 custom-scrollbar">
                    {visibleChatMessages.length ? (
                      visibleChatMessages.map((m) => {
                        const groupCode = (session?.flight || '').toString();
                        const myFrom = groupCode ? `FLIGHT ${groupCode}` : 'CADDIE';
                        const isOut = m.fromRole === 'caddie' && (m.from || '') === myFrom;
                        return (
                          <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[80%] flex flex-col">
                              {!isOut && (
                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">{m.from || 'CADDIE'}</div>
                              )}
                              <div className={`rounded-2xl px-5 py-3.5 text-[16px] font-bold shadow-sm ${
                                isOut 
                                  ? 'bg-blue-600 text-white rounded-br-sm' 
                                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                              }`}>
                                {m.text}
                              </div>
                              <span className={`text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1 ${isOut ? 'justify-end mr-1' : 'ml-1'}`}>
                                {String(m.id).startsWith('temp-') ? (
                                  <><Spinner size={10} /> mengirim...</>
                                ) : (
                                  new Date(m.ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-50">
                        <MessageCircle size={48} className="text-slate-300 mb-4" />
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Belum ada pesan</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-4 relative z-10 bg-white p-2 rounded-[22px] border border-slate-200 shadow-sm">
                    <input
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          appendChatMessage({ to: chatRecipient, text: chatDraft });
                        }
                      }}
                      placeholder={`Ketik pesan untuk ${chatRecipient === 'control' ? 'Pusat Kontrol' : chatRecipient === 'all' ? 'Semua Group' : 'Marshal'}...`}
                      className="flex-1 h-14 bg-transparent text-slate-700 px-6 text-[16px] font-semibold outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => appendChatMessage({ to: chatRecipient, text: chatDraft })}
                      className="h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-600/20"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="translate-x-0.5">
                        <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marshal Password Modal */}
      {isMarshalModalOpen && marshalTarget && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" />
          
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            {/* Header */}
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
                        <div className="w-3 h-3 bg-orange-600 rounded-full animate-in zoom-in" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => marshalPassword.length < 4 && setMarshalPassword(prev => prev + num)}
                    className="h-14 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl text-xl font-black text-slate-700 border border-slate-200/50 shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setMarshalPassword('')}
                  className="h-14 bg-red-50 hover:bg-red-100 active:scale-95 transition-all rounded-xl text-xs font-black text-red-600 border border-red-200/50"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => marshalPassword.length < 4 && setMarshalPassword(prev => prev + '0')}
                  className="h-14 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl text-xl font-black text-slate-700 border border-slate-200/50 shadow-sm"
                >
                  0
                </button>
                <button
                  onClick={() => setMarshalPassword(prev => prev.slice(0, -1))}
                  className="h-14 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl flex items-center justify-center text-slate-700 border border-slate-200/50 shadow-sm"
                >
                  <Delete size={20} />
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsMarshalModalOpen(false);
                    setMarshalPassword('');
                  }}
                  disabled={marshalVerifying}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all disabled:opacity-40"
                >
                  Batal
                </button>
                <button 
                  onClick={handleMarshalAuth}
                  disabled={marshalVerifying}
                  className="flex-[2] py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-70 disabled:cursor-wait text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  {marshalVerifying && <Spinner size={14} />}
                  {marshalVerifying ? 'Memeriksa PIN...' : 'Konfirmasi Marshal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Approval Modal */}
      {isApprovalModalOpen && approvalData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
          
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            {/* Header */}
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white text-2xl uppercase italic tracking-tight">Persetujuan Pemain</h3>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Konfirmasi Skor Hole {approvalData.holeNumber}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="text-emerald-400" size={24} />
              </div>
            </div>

            <div className="p-8 space-y-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hole</span>
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100">
                  <span className="text-2xl font-black text-slate-800">{approvalData.holeNumber}</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skor Pemain</span>
                <div className="flex flex-col gap-2">
                  {approvalData.players.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{p.playerName}</span>
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-lg font-black text-white italic">{p.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs font-bold text-slate-500 leading-relaxed px-2">
                Kami menyatakan bahwa skor yang dimasukkan oleh caddie untuk hole ini adalah benar.
              </p>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => {
                    setIsApprovalModalOpen(false);
                    setApprovalData(null);
                  }}
                  disabled={approving}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl transition-all disabled:opacity-40"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmApproval}
                  disabled={approving}
                  className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 disabled:cursor-wait text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {approving && <Spinner size={16} />}
                  {approving ? 'Menyimpan...' : 'Setujui Semua'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentScorecard;
