import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Users, 
  Search, 
  Download, 
  Trophy,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Filter,
  AlertCircle,
  Trash2,
  XCircle,
  QrCode,
  FileSpreadsheet,
  Upload,
  Plus,
  X
} from 'lucide-react';

const TournamentPlayers = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedTournamentKeyRef = useRef<string>('');
  const currentAdminLocation = localStorage.getItem('adminLocation') || 'Padang Golf Sulaiman';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [flightFilter, setFlightFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [isFilterResultsView, setIsFilterResultsView] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [flightGroups, setFlightGroups] = useState<any[]>([]);
  const [caddiesMaster, setCaddiesMaster] = useState<any[]>([]);
  const [selectedPlayerForQR, setSelectedPlayerForQR] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  // Edit Player State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTournamentInfo, setImportTournamentInfo] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 10),
    course: currentAdminLocation,
    tee: 'White',
    teeTime: '07:00',
    rules: 'Stroke Play',
    scoringMethod: 'System 36'
  });

  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isAllGroupsView, setIsAllGroupsView] = useState(false);
  const [isGroupsLocked, setIsGroupsLocked] = useState(false);
  const [revealedGroups, setRevealedGroups] = useState<Record<number, boolean>>({});
  const [isManualGroupModalOpen, setIsManualGroupModalOpen] = useState(false);
  const [manualGroupSearch, setManualGroupSearch] = useState('');
  const [manualGroupFlightFilter, setManualGroupFlightFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [manualGroupsDraft, setManualGroupsDraft] = useState<Array<{ id: string; name: string; playerIds: string[] }>>([]);
  const [manualActiveGroupIndex, setManualActiveGroupIndex] = useState(0);

  const normalizeDateKey = (value: any) => {
    if (!value) return '';
    const s = value instanceof Date ? value.toISOString() : value.toString();
    if (!s) return '';
    return s.includes('T') ? s.slice(0, 10) : s.slice(0, 10);
  };

  const getTournamentKey = (info: any) => {
    if (!info) return '';
    const id = (info.id || info.tournamentId || '').toString();
    if (id) return id;
    const name = (info.name || '').toString();
    const date = normalizeDateKey(info.date);
    const course = (info.course || '').toString();
    return `${name}|${date}|${course}`;
  };

  useEffect(() => {
    const savedCaddies = localStorage.getItem('golf_caddies_master');
    if (savedCaddies) {
      setCaddiesMaster(JSON.parse(savedCaddies));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from API first
        const response = await api.get('/tournaments/active');
        if (response.data) {
          const tournament = response.data;
          
          // Auto-fix for old "Imported Tournament" name
          if (tournament.name === 'Imported Tournament') {
            tournament.name = 'Tournament Participants';
          }

          // Normalize the data format from database to match what frontend expects
          const normalizedGroups = (tournament.groups || []).map((g: any, idx: number) => {
            const sequence = (idx + 1).toString().padStart(3, '0');
            const currentCaddie = g.caddie || { number: sequence, name: 'Unassigned' };
            
            // Sanitize: Strip 'C-' or 'C' if it exists in the number
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
              ...g,
              caddie: {
                ...currentCaddie,
                number: cleanNumber,
                name: cleanName
              }
            };
          });

          setPlayers(tournament.players || []);
          setTournamentInfo(tournament);
          setImportTournamentInfo({
            name: tournament.name || '',
            date: tournament.date ? new Date(tournament.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            course: tournament.course || currentAdminLocation,
            tee: tournament.teeBox || 'White',
            teeTime: tournament.teeTime || '07:00',
            rules: tournament.rules || 'Stroke Play',
            scoringMethod: tournament.scoringMethod || 'System 36'
          });
          {
            const tournamentKey = getTournamentKey(tournament);
            const shouldResetUi = loadedTournamentKeyRef.current !== tournamentKey;
            loadedTournamentKeyRef.current = tournamentKey;
            if (shouldResetUi) {
              setIsFilterResultsView(false);
              setIsAllGroupsView(false);
              setActiveGroupIndex(0);
              setRevealedGroups({});
            }
          }
          if (normalizedGroups.length === 0) {
            localStorage.removeItem('active_tournament_draft_groups');
          }
          setFlightGroups(normalizedGroups);
          setIsGroupsLocked(normalizedGroups.length > 0 ? ((tournament as any)?.groupsLocked ?? true) : false);
          
          // Also update localStorage
          const localData = {
            info: tournament,
            players: tournament.players,
            groups: normalizedGroups,
            publishedAt: tournament.publishedAt,
            groupsLocked: (tournament as any)?.groupsLocked ?? (normalizedGroups.length > 0)
          };
          localStorage.setItem('active_tournament', JSON.stringify(localData));
          return;
        }
      } catch (error) {
        console.warn('API error or no active tournament in DB, falling back to localStorage:', error);
      }

      // Fallback to localStorage if API fails or no data
      const savedData = localStorage.getItem('active_tournament');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Auto-fix for old "Imported Tournament" name in local storage
        if (parsedData.info?.name === 'Imported Tournament') {
          parsedData.info.name = 'Tournament Participants';
          localStorage.setItem('active_tournament', JSON.stringify(parsedData));
        }

        const normalizedGroups = (parsedData.groups || []).map((g: any, idx: number) => {
          const sequence = (idx + 1).toString().padStart(3, '0');
          const currentCaddie = g.caddie || { number: sequence, name: 'Unassigned' };
          
          // Sanitize: Strip 'C-' or 'C' if it exists in the number
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
            ...g,
            caddie: {
              ...currentCaddie,
              number: cleanNumber,
              name: cleanName
            }
          };
        });

        setPlayers(parsedData.players || []);
        setTournamentInfo(parsedData.info || null);
        {
          const tournamentKey = getTournamentKey(parsedData.info);
          const shouldResetUi = loadedTournamentKeyRef.current !== tournamentKey;
          loadedTournamentKeyRef.current = tournamentKey;
          if (shouldResetUi) {
            setIsFilterResultsView(false);
            setIsAllGroupsView(false);
            setActiveGroupIndex(0);
            setRevealedGroups({});
          }
        }
        if (normalizedGroups.length === 0) {
          localStorage.removeItem('active_tournament_draft_groups');
        }
        setFlightGroups(normalizedGroups);
        setIsGroupsLocked(normalizedGroups.length > 0 ? (parsedData.groupsLocked ?? true) : false);
      }
    };

    loadData();
  }, []);

  const flights = [
    { id: 'A', label: 'Flight A', range: 'HCP 1-13', color: 'text-blue-500' },
    { id: 'B', label: 'Flight B', range: 'HCP 14-21', color: 'text-emerald-500' },
    { id: 'C', label: 'Flight C', range: 'HCP 22-28', color: 'text-amber-500' },
  ];

  const matchesFlightFilter = (p: any) => {
    if (flightFilter === 'ALL') return true;
    return (p?.flight || '').toString().toUpperCase() === flightFilter;
  };

  const filteredPlayers = players.filter((p: any) =>
    matchesFlightFilter(p) &&
    (
      (p?.name || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p?.handicap ?? '').toString().includes(searchTerm)
    )
  );

  const toPlayerKey = (p: any) => (p?.id ?? p?.code ?? p?.name ?? '').toString();

  const manualAssignedKeys = new Set(
    manualGroupsDraft.reduce((acc: string[], g) => {
      const ids = Array.isArray(g?.playerIds) ? g.playerIds : [];
      return acc.concat(ids);
    }, [])
  );
  const manualUnassignedPlayers = players.filter(p => !manualAssignedKeys.has(toPlayerKey(p)));
  const manualAvailablePlayers = manualUnassignedPlayers
    .filter((p: any) => {
      const q = manualGroupSearch.trim().toLowerCase();
      if (q && !(p?.name || '').toString().toLowerCase().includes(q)) return false;
      if (manualGroupFlightFilter !== 'ALL') {
        const f = (p?.flight || '').toString().toUpperCase();
        if (f !== manualGroupFlightFilter) return false;
      }
      return true;
    })
    .slice()
    .sort((a: any, b: any) => (a?.name || '').toString().localeCompare((b?.name || '').toString()));

  const manualActiveGroup = manualGroupsDraft[manualActiveGroupIndex];
  const manualActiveGroupPlayers = (manualActiveGroup?.playerIds || [])
    .map(k => players.find(p => toPlayerKey(p) === k))
    .filter(Boolean) as any[];

  const shuffleArray = <T,>(items: T[]) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const autoGroupPlayers = (playersList: any[]) => {
    const toKey = (name: string) =>
      name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '');

    const nameAliases: Record<string, string[]> = {
      LUKY: ['LUCKY'],
      IKBAL: ['IQBAL'],
      EFFENDI: ['EFENDI'],
      'MANG JP': ['MANG JEPE', 'MANG JEP']
    };

    const candidateNames = (name: string) => {
      const key = name.trim().toUpperCase();
      const aliases = nameAliases[key] || [];
      return [name, ...aliases];
    };

    const reservedGroups = [
      { targetIndex: 6, groupName: 'FLIGHT 7', names: ['MANG JP', 'DYLAN'] },
      { targetIndex: 7, groupName: 'FLIGHT 8', names: ['ANANG', 'IKBAL', 'EFFENDI', 'BUDIMAN'] },
      { targetIndex: 8, groupName: 'FLIGHT 9', names: ['JEFRI', 'RIDHO', 'RIZKY', 'LUKY'] }
    ];

    const playersWithFlight = playersList.map(p => {
      const hcp = parseInt(p.handicap) || 0;
      let flight = 'C';
      if (hcp >= 1 && hcp <= 13) flight = 'A';
      else if (hcp >= 14 && hcp <= 21) flight = 'B';
      else if (hcp >= 22) flight = 'C'; // Assuming > 28 is also C or handle as needed
      return { ...p, flight };
    });

    const poolAll = [...playersWithFlight];
    const reservedGroupPlayers = reservedGroups.map((rg) => {
      const picked: any[] = [];
      rg.names.forEach((n) => {
        const candidateKeys = candidateNames(n).map(toKey).filter(Boolean);
        const idx = poolAll.findIndex((p: any) => {
          const pKey = toKey(p?.name || '');
          if (!pKey) return false;
          return candidateKeys.some((cKey) => cKey && (pKey.includes(cKey) || cKey.includes(pKey)));
        });
        if (idx !== -1) {
          picked.push(poolAll[idx]);
          poolAll.splice(idx, 1);
        }
      });
      return { ...rg, players: picked };
    });

    const pullFromPool = (predicate: (p: any) => boolean) => {
      const idx = poolAll.findIndex(predicate);
      if (idx === -1) return null;
      const picked = poolAll[idx];
      poolAll.splice(idx, 1);
      return picked;
    };

    const flight7 = reservedGroupPlayers.find((rg) => rg.groupName === 'FLIGHT 7');
    if (flight7) {
      const desiredSize = 4;
      const hasC = flight7.players.some((p: any) => (p?.flight || '').toString().toUpperCase() === 'C');
      const currentA = flight7.players.filter((p: any) => (p?.flight || '').toString().toUpperCase() === 'A').length;
      const currentB = flight7.players.filter((p: any) => (p?.flight || '').toString().toUpperCase() === 'B').length;

      if (hasC) {
        while (flight7.players.length < desiredSize) {
          const picked = pullFromPool((p: any) => (p?.flight || '').toString().toUpperCase() === 'C');
          if (!picked) break;
          flight7.players.push(picked);
        }
      } else {
        const needed = Math.max(0, Math.min(2, desiredSize - flight7.players.length));
        if (needed === 1) {
          const picked =
            pullFromPool((p: any) => (p?.flight || '').toString().toUpperCase() === 'B') ||
            pullFromPool((p: any) => (p?.flight || '').toString().toUpperCase() === 'A');
          if (picked) {
            const nextA = currentA + ((picked.flight || '').toString().toUpperCase() === 'A' ? 1 : 0);
            const nextB = currentB + ((picked.flight || '').toString().toUpperCase() === 'B' ? 1 : 0);
            if (nextB >= nextA) flight7.players.push(picked);
            else poolAll.push(picked);
          }
        }
        if (needed === 2) {
          const candidates = shuffleArray(poolAll.filter((p: any) => ['A', 'B'].includes((p?.flight || '').toString().toUpperCase())));
          let pickedPair: any[] | null = null;
          const limit = Math.min(80, candidates.length);
          for (let i = 0; i < limit && !pickedPair; i++) {
            for (let j = i + 1; j < limit; j++) {
              const aInc =
                ((candidates[i].flight || '').toString().toUpperCase() === 'A' ? 1 : 0) +
                ((candidates[j].flight || '').toString().toUpperCase() === 'A' ? 1 : 0);
              const bInc =
                ((candidates[i].flight || '').toString().toUpperCase() === 'B' ? 1 : 0) +
                ((candidates[j].flight || '').toString().toUpperCase() === 'B' ? 1 : 0);
              if (currentB + bInc >= currentA + aInc) {
                pickedPair = [candidates[i], candidates[j]];
                break;
              }
            }
          }
          if (pickedPair) {
            pickedPair.forEach((pp) => {
              const idx = poolAll.findIndex((x: any) => x === pp);
              if (idx !== -1) poolAll.splice(idx, 1);
            });
            flight7.players.push(...pickedPair);
          } else {
            while (flight7.players.length < desiredSize) {
              const picked = pullFromPool((p: any) => (p?.flight || '').toString().toUpperCase() === 'B');
              if (!picked) break;
              flight7.players.push(picked);
            }
          }
        }
      }
    }

    const playersA = shuffleArray(poolAll.filter(p => p.flight === 'A'));
    const playersB = shuffleArray(poolAll.filter(p => p.flight === 'B'));
    const playersC = shuffleArray(poolAll.filter(p => p.flight === 'C'));

    const groups: any[][] = [];

    // 1) Group C (C harus terpisah, hanya sesama C) - target 3-4 per group
    {
      const pool = [...playersC];
      const cGroups: any[][] = [];

      while (pool.length > 0) {
        if (pool.length >= 3 && pool.length % 4 === 2) {
          cGroups.push(pool.splice(0, 3));
          continue;
        }
        if (pool.length >= 3 && pool.length % 4 === 1) {
          cGroups.push(pool.splice(0, 3));
          continue;
        }
        if (pool.length >= 4) {
          cGroups.push(pool.splice(0, 4));
          continue;
        }
        cGroups.push(pool.splice(0, pool.length));
      }

      const smallIdx = cGroups.findIndex(g => g.length > 0 && g.length < 3);
      if (smallIdx !== -1) {
        const donorIdx = cGroups.findIndex(g => g.length === 4);
        if (donorIdx !== -1) {
          const moved = cGroups[donorIdx].pop();
          cGroups[smallIdx].push(moved);
        }
      }

      cGroups.forEach(g => groups.push(g));
    }

    // 2) Group A & B (A dan B boleh campur)
    // RULE: Jumlah Flight B tidak boleh lebih sedikit dari Flight A (B >= A)
    {
      const poolA = [...playersA];
      const poolB = [...playersB];

      const take = (pool: any[], n: number) => pool.splice(0, n);
      const pushGroup = (g: any[]) => groups.push(g);

      while (poolA.length + poolB.length >= 3) {
        if (poolA.length + poolB.length >= 4) {
          if (poolA.length >= 1 && poolB.length >= 3) {
            pushGroup([...take(poolA, 1), ...take(poolB, 3)]);
            continue;
          }
          if (poolA.length >= 2 && poolB.length >= 2) {
            pushGroup([...take(poolA, 2), ...take(poolB, 2)]);
            continue;
          }
          if (poolB.length >= 4) {
            pushGroup(take(poolB, 4));
            continue;
          }
        }

        if (poolA.length >= 1 && poolB.length >= 2) {
          pushGroup([...take(poolA, 1), ...take(poolB, 2)]);
          continue;
        }
        if (poolB.length >= 3) {
          pushGroup(take(poolB, 3));
          continue;
        }
        break;
      }

      const leftovers = [...poolB, ...poolA];
      if (leftovers.length > 0 && groups.length > 0) {
        const canAdd = (g: any[], p: any) => {
          if (g.length >= 4) return false;
          const next = [...g, p];
          const a = next.filter(x => x.flight === 'A').length;
          const b = next.filter(x => x.flight === 'B').length;
          if (a > 0 && b > 0 && b < a) return false;
          return true;
        };

        const unplaced: any[] = [];
        leftovers.forEach((p) => {
          const idx = groups.findIndex((g) => g[0]?.flight !== 'C' && canAdd(g, p));
          if (idx !== -1) {
            groups[idx].push(p);
          } else {
            unplaced.push(p);
          }
        });

        if (unplaced.length > 0) {
          groups.push(unplaced);
        }
      }
    }

    {
      const countAB = (g: any[]) => {
        const a = g.filter(p => p.flight === 'A').length;
        const b = g.filter(p => p.flight === 'B').length;
        return { a, b };
      };

      const isValidAB = (g: any[]) => {
        const { a, b } = countAB(g);
        if (a > 0 && b > 0 && b < a) return false;
        return true;
      };

      const isCGroup = (g: any[]) => g.length > 0 && g.every(p => p.flight === 'C');

      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (isCGroup(g)) continue;
        if (g.length >= 3) continue;

        for (let j = 0; j < groups.length && g.length < 3; j++) {
          if (i === j) continue;
          const donor = groups[j];
          if (isCGroup(donor)) continue;
          if (donor.length !== 4) continue;

          const tryMoveIndex = donor.findIndex((p: any, idx: number) => {
            const donorAfter = donor.filter((_: any, i2: number) => i2 !== idx);
            const receiverAfter = [...g, p];
            return isValidAB(donorAfter) && isValidAB(receiverAfter);
          });

          if (tryMoveIndex !== -1) {
            const [moved] = donor.splice(tryMoveIndex, 1);
            g.push(moved);
          }
        }
      }

      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (!isCGroup(g)) continue;
        if (g.length >= 3) continue;

        const donorIdx = groups.findIndex((d) => isCGroup(d) && d.length === 4);
        if (donorIdx !== -1) {
          const moved = groups[donorIdx].pop();
          g.push(moved);
        }
      }
    }

    {
      const countAB = (g: any[]) => {
        const a = g.filter(p => p.flight === 'A').length;
        const b = g.filter(p => p.flight === 'B').length;
        return { a, b };
      };

      const isBadAB = (g: any[]) => {
        const { a, b } = countAB(g);
        if (a === 0 || b === 0) return false;
        return b < a;
      };

      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (g[0]?.flight === 'C') continue;
        if (!isBadAB(g)) continue;

        const aIdx = g.findIndex(p => p.flight === 'A');
        if (aIdx === -1) continue;

        let fixed = false;
        for (let j = 0; j < groups.length; j++) {
          if (j === i) continue;
          const donor = groups[j];
          if (donor[0]?.flight === 'C') continue;

          const bIdx = donor.findIndex(p => p.flight === 'B');
          if (bIdx === -1) continue;

          const swappedG = [...g];
          const swappedDonor = [...donor];
          const aPlayer = swappedG[aIdx];
          const bPlayer = swappedDonor[bIdx];
          swappedG[aIdx] = bPlayer;
          swappedDonor[bIdx] = aPlayer;

          if (!isBadAB(swappedG) && !isBadAB(swappedDonor)) {
            groups[i] = swappedG;
            groups[j] = swappedDonor;
            fixed = true;
            break;
          }
        }

        if (!fixed) {
          continue;
        }
      }
    }

    reservedGroupPlayers
      .sort((a, b) => a.targetIndex - b.targetIndex)
      .forEach((rg) => {
        if (!rg.players?.length) return;
        const idx = Math.min(Math.max(0, rg.targetIndex), groups.length);
        groups.splice(idx, 0, rg.players);
      });

    return groups;
  };


  const deletePlayer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      const savedData = localStorage.getItem('active_tournament');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const updatedPlayers = parsedData.players.filter((p: any) => p.id !== id);
        
        // Also update groups to remove player
        const updatedGroups = (parsedData.groups || []).map((g: any) => ({
          ...g,
          players: g.players.filter((p: any) => p.id !== id)
        })).filter((g: any) => g.players.length > 0);

        const newData = { ...parsedData, players: updatedPlayers, groups: updatedGroups };
        localStorage.setItem('active_tournament', JSON.stringify(newData));
        
        // Sync to API if needed
        api.post('/tournaments', newData).catch(err => console.warn('Failed to sync delete to API', err));

        setPlayers(updatedPlayers);
        setFlightGroups(updatedGroups);
      }
    }
  };

  const handleEditSave = () => {
    if (!editingPlayer) return;

    const savedData = localStorage.getItem('active_tournament');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Update in players list
      const updatedPlayers = parsedData.players.map((p: any) => 
        p.id === editingPlayer.id ? { ...p, ...editingPlayer } : p
      );
      
      // Update in groups list
      const updatedGroups = (parsedData.groups || []).map((g: any) => ({
        ...g,
        players: g.players.map((p: any) => 
          p.id === editingPlayer.id ? { ...p, ...editingPlayer } : p
        )
      }));

      const newData = { ...parsedData, players: updatedPlayers, groups: updatedGroups };
      localStorage.setItem('active_tournament', JSON.stringify(newData));
      
      // Sync to API
      api.post('/tournaments', newData).catch(err => console.warn('Failed to sync edit to API', err));

      setPlayers(updatedPlayers);
      setFlightGroups(updatedGroups);
      setIsEditModalOpen(false);
      setEditingPlayer(null);
    }
  };

  const deleteAllPlayers = async () => {
    if (window.confirm('CRITICAL: This will delete ALL tournament data (Players, Groups, and Scores). Are you sure?')) {
      try {
        // 1. Try to delete from API first
        await api.delete('/tournaments').catch(err => console.warn('API delete failed, proceeding with local clear:', err));
        
        // 2. Clear all local storage related to tournament
        localStorage.removeItem('active_tournament');
        localStorage.removeItem('active_tournament_draft_groups');
        localStorage.removeItem('tournament_session');
        localStorage.removeItem('golf_players_scores');
        localStorage.removeItem('golf_group_name');
        
        // Clear all individual player scores
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('tournament_scores_')) {
            localStorage.removeItem(key);
          }
        });

        // 3. Reset state
        setPlayers([]);
        setTournamentInfo(null);
        setFlightGroups([]);
        
        alert('All tournament data has been successfully cleared.');
      } catch (error) {
        console.error('Error in deleteAllPlayers:', error);
        alert('An error occurred while deleting data.');
      }
    }
  };

  const downloadExcelTemplate = () => {
    const headers = ['Name', 'Handicap', 'DOB (YYYY-MM-DD)', 'Phone', 'Email', 'Shirt Size (S/M/L/XL/XXL)'];
    
    // Generate 40 sample players
    const samplePlayers = [];
    for (let i = 1; i <= 40; i++) {
      // Varying HCP for testing A, B, C flights
      let hcp;
      if (i <= 15) hcp = 1 + Math.floor(Math.random() * 12); // Flight A (1-13)
      else if (i <= 30) hcp = 14 + Math.floor(Math.random() * 7); // Flight B (14-21)
      else hcp = 22 + Math.floor(Math.random() * 6); // Flight C (22-28)

      const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      const shirt = shirtSizes[Math.floor(Math.random() * shirtSizes.length)];
      
      samplePlayers.push(`Player ${i},${hcp},1985-01-${(i % 28 + 1).toString().padStart(2, '0')},081234567${i.toString().padStart(2, '0')},player${i}@example.com,${shirt}`);
    }

    const csvContent = [
      headers.join(','),
      ...samplePlayers
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tournament_players_40_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportModalOpen(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newPlayers: any[] = [];
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const delimiter =
          file.name.toLowerCase().endsWith('.tsv') || line.includes('\t')
            ? '\t'
            : ',';
        const [name, handicap, dob, phone, email, shirtSize] = line.split(delimiter);
        if (name) {
          const hcpVal = parseInt(handicap?.trim() || '0');
          let assignedFlight = 'A';
          if (hcpVal >= 14 && hcpVal <= 21) assignedFlight = 'B';
          else if (hcpVal >= 22) assignedFlight = 'C';

          newPlayers.push({
            id: Date.now() + i,
            name: name.trim(),
            handicap: hcpVal.toString(),
            dob: dob?.trim() || '',
            phone: phone?.trim() || '',
            email: email?.trim() || '',
            shirtSize: shirtSize?.trim() || 'L',
            flight: assignedFlight
          });
        }
      }

      if (newPlayers.length > 0) {
        // Clear existing scorecard sessions
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('tournament_scores_') || key === 'tournament_session') {
            localStorage.removeItem(key);
          }
        });

        const tournamentToUpdate: any = {
          info: {
            name: importTournamentInfo.name || `Imported Tournament ${new Date().toISOString().slice(0, 10)}`,
            course: importTournamentInfo.course || currentAdminLocation,
            rules: importTournamentInfo.rules || 'Stroke Play',
            scoringMethod: importTournamentInfo.scoringMethod || 'System 36',
            date: importTournamentInfo.date || new Date().toISOString().split('T')[0],
            teeTime: importTournamentInfo.teeTime || '07:00',
            tee: importTournamentInfo.tee || 'White'
          },
          players: newPlayers,
          groups: [],
          publishedAt: new Date().toISOString(),
          archivePrevious: true
        };
        
        // Save to Database MySQL via API
        api.post('/tournaments', tournamentToUpdate)
          .then((res) => {
            const savedTournament = res.data;
            const normalizedGroups = (savedTournament.groups || []).map((g: any, idx: number) => {
              const sequence = (idx + 1).toString().padStart(3, '0');
              const currentCaddie = g.caddie || { number: sequence, name: 'Unassigned' };
              let cleanNumber = currentCaddie.number.toString();
              if (cleanNumber.startsWith('C-')) cleanNumber = cleanNumber.replace('C-', '');
              else if (cleanNumber.startsWith('C')) cleanNumber = cleanNumber.replace('C', '');
              let cleanName = currentCaddie.name;
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
                ...g,
                caddie: {
                  ...currentCaddie,
                  number: cleanNumber,
                  name: cleanName
                }
              };
            });

            setPlayers(savedTournament.players || []);
            setTournamentInfo(savedTournament);
            setImportTournamentInfo({
              name: savedTournament.name || '',
              date: savedTournament.date ? new Date(savedTournament.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              course: savedTournament.course || currentAdminLocation,
              tee: savedTournament.teeBox || 'White',
              teeTime: savedTournament.teeTime || '07:00',
              rules: savedTournament.rules || 'Stroke Play',
              scoringMethod: savedTournament.scoringMethod || 'System 36'
            });
            setFlightGroups(normalizedGroups);
            setActiveGroupIndex(0);
            setIsAllGroupsView(false);
            setIsGroupsLocked(false);
            localStorage.removeItem('active_tournament_draft_groups');
            localStorage.setItem('active_tournament', JSON.stringify({
              info: savedTournament,
              players: savedTournament.players,
              groups: normalizedGroups,
              publishedAt: savedTournament.publishedAt,
              groupsLocked: false
            }));

            alert(`Berhasil import ${newPlayers.length} pemain. Auto-grouping belum dijalankan.`);
          })
          .catch(err => {
            console.error('Error saving imported players to DB:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            alert(`Players imported locally but failed to save to database: ${errorMsg}`);
          });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const draftGroupsKey = 'active_tournament_draft_groups';

  const buildGroupsWithCodes = (playersList: any[]) => {
    const currentYear = new Date().getFullYear();
    const generatedGroups = autoGroupPlayers(playersList);
    return generatedGroups.map((group, index) => {
      const sequence = (index + 1).toString().padStart(2, '0');
      const code = `GF-OPEN-${currentYear}-${sequence}`;
      return {
        id: `group-${index + 1}`,
        name: `FLIGHT ${index + 1}`,
        code,
        players: group,
        flightType: Array.from(new Set(group.map((p: any) => p.flight))).join('+'),
        caddie: { number: sequence, name: 'Unassigned' }
      };
    });
  };

  const handleGenerateDraftGroups = () => {
    if (!players.length || isGroupsLocked) return;
    const groupsWithCodes = buildGroupsWithCodes(players);
    setFlightGroups(groupsWithCodes);
    setActiveGroupIndex(0);
    setIsAllGroupsView(false);
    setIsGroupsLocked(false);
    setRevealedGroups({});
    const tournamentKey = getTournamentKey({
      id: tournamentInfo?.id,
      name: importTournamentInfo.name || tournamentInfo?.name,
      date: importTournamentInfo.date || tournamentInfo?.date,
      course: importTournamentInfo.course || tournamentInfo?.course
    });
    localStorage.setItem(draftGroupsKey, JSON.stringify({ tournamentKey, groups: groupsWithCodes }));
  };

  const handleRegenerateGroups = () => {
    handleGenerateDraftGroups();
  };

  const openManualGroupModal = () => {
    if (!players.length || isGroupsLocked) return;
    const seed =
      flightGroups.length > 0 && !isGroupsLocked
        ? flightGroups.map((g: any, idx: number) => ({
            id: `manual-${idx + 1}`,
            name: (g?.name || `FLIGHT ${idx + 1}`).toString(),
            playerIds: Array.isArray(g?.players) ? g.players.map((p: any) => toPlayerKey(p)).filter(Boolean) : []
          }))
        : Array.from({ length: Math.max(1, Math.ceil(players.length / 4)) }).map((_, idx: number) => ({
            id: `manual-${idx + 1}`,
            name: `FLIGHT ${idx + 1}`,
            playerIds: []
          }));

    setManualGroupsDraft(seed);
    setManualActiveGroupIndex(0);
    setManualGroupSearch('');
    setManualGroupFlightFilter('ALL');
    setIsManualGroupModalOpen(true);
  };

  const addManualFlight = () => {
    setManualGroupsDraft(prev => {
      const nextIndex = prev.length + 1;
      setManualActiveGroupIndex(prev.length);
      return [...prev, { id: `manual-${nextIndex}`, name: `FLIGHT ${nextIndex}`, playerIds: [] }];
    });
  };

  const removeManualFlight = (index: number) => {
    setManualGroupsDraft(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index).map((g, idx) => ({ ...g, name: `FLIGHT ${idx + 1}` }));
      return next;
    });
    setManualActiveGroupIndex(prev => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const addPlayerToManualGroup = (player: any) => {
    const key = toPlayerKey(player);
    if (!key) return;
    setManualGroupsDraft(prev => {
      const alreadyAssigned = prev.some(g => g.playerIds.includes(key));
      if (alreadyAssigned) return prev;
      return prev.map((g, idx) => {
        if (idx !== manualActiveGroupIndex) return g;
        if (g.playerIds.length >= 8) return g;
        return { ...g, playerIds: [...g.playerIds, key] };
      });
    });
  };

  const removePlayerFromManualGroup = (playerKey: string) => {
    setManualGroupsDraft(prev =>
      prev.map((g, idx) => {
        if (idx !== manualActiveGroupIndex) return g;
        return { ...g, playerIds: g.playerIds.filter(k => k !== playerKey) };
      })
    );
  };

  const handleSaveManualGroups = () => {
    if (!players.length || isGroupsLocked) return;
    if (!manualGroupsDraft.length) return;

    const assigned = new Set(
      manualGroupsDraft.reduce((acc: string[], g) => {
        const ids = Array.isArray(g?.playerIds) ? g.playerIds : [];
        return acc.concat(ids);
      }, [])
    );
    const unassignedCount = players.filter(p => !assigned.has(toPlayerKey(p))).length;
    if (unassignedCount > 0) {
      alert(`Masih ada ${unassignedCount} player belum dimasukkan ke flight.`);
      return;
    }

    for (let i = 0; i < manualGroupsDraft.length; i++) {
      const g = manualGroupsDraft[i];
      if (g.playerIds.length < 3 || g.playerIds.length > 8) {
        alert(`FLIGHT ${i + 1} harus berisi 3-8 player.`);
        return;
      }
      const groupPlayers = g.playerIds
        .map(k => players.find(p => toPlayerKey(p) === k))
        .filter(Boolean) as any[];

      const flightsInGroup = groupPlayers.map(p => (p?.flight || '').toString().toUpperCase()).filter(Boolean);
      const hasC = flightsInGroup.includes('C');
      const uniqueFlights = Array.from(new Set(flightsInGroup));
      if (hasC && uniqueFlights.length > 1) {
        alert(`FLIGHT ${i + 1} tidak boleh mencampur Flight C dengan Flight A/B.`);
        return;
      }

      const countA = flightsInGroup.filter(f => f === 'A').length;
      const countB = flightsInGroup.filter(f => f === 'B').length;
      if (countA > 0 && countB > 0 && countB < countA) {
        alert(`FLIGHT ${i + 1} melanggar rule: jumlah Flight B tidak boleh lebih sedikit dari Flight A (B >= A).`);
        return;
      }
    }

    const currentYear = new Date().getFullYear();
    const groupsWithCodes = manualGroupsDraft.map((g, index) => {
      const sequence = (index + 1).toString().padStart(2, '0');
      const code = `GF-OPEN-${currentYear}-${sequence}`;
      const groupPlayers = g.playerIds
        .map(k => players.find(p => toPlayerKey(p) === k))
        .filter(Boolean) as any[];
      return {
        id: `group-${index + 1}`,
        name: `FLIGHT ${index + 1}`,
        code,
        players: groupPlayers,
        flightType: Array.from(new Set(groupPlayers.map((p: any) => (p?.flight || '').toString().toUpperCase()))).filter(Boolean).join('+'),
        caddie: { number: sequence, name: 'Unassigned' }
      };
    });

    setFlightGroups(groupsWithCodes);
    setActiveGroupIndex(0);
    setIsAllGroupsView(false);
    setIsGroupsLocked(false);
    setRevealedGroups({});
    const tournamentKey = getTournamentKey({
      id: tournamentInfo?.id,
      name: importTournamentInfo.name || tournamentInfo?.name,
      date: importTournamentInfo.date || tournamentInfo?.date,
      course: importTournamentInfo.course || tournamentInfo?.course
    });
    localStorage.setItem(draftGroupsKey, JSON.stringify({ tournamentKey, groups: groupsWithCodes }));
    setIsManualGroupModalOpen(false);
  };

  const handleActivateGroups = async () => {
    if (!players.length || !flightGroups.length || isGroupsLocked) return;

    const tournamentData: any = {
      info: {
        name: importTournamentInfo.name || tournamentInfo?.name || `Tournament ${new Date().toISOString().slice(0, 10)}`,
        course: importTournamentInfo.course || tournamentInfo?.course || currentAdminLocation,
        rules: importTournamentInfo.rules || tournamentInfo?.rules || 'Stroke Play',
        scoringMethod: importTournamentInfo.scoringMethod || tournamentInfo?.scoringMethod || 'System 36',
        date:
          importTournamentInfo.date ||
          (tournamentInfo?.date
            ? new Date(tournamentInfo.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)),
        teeTime: importTournamentInfo.teeTime || tournamentInfo?.teeTime || '07:00',
        tee: importTournamentInfo.tee || tournamentInfo?.teeBox || 'White'
      },
      players,
      groups: flightGroups,
      publishedAt: new Date().toISOString(),
      archivePrevious: true
    };

    try {
      const res = await api.post('/tournaments', tournamentData);
      const savedTournament = res.data;
      const normalizedGroups = (savedTournament.groups || []).map((g: any, idx: number) => {
        const sequence = (idx + 1).toString().padStart(2, '0');
        const currentCaddie = g.caddie || { number: sequence, name: 'Unassigned' };
        let cleanNumber = currentCaddie.number.toString();
        if (cleanNumber.startsWith('C-')) cleanNumber = cleanNumber.replace('C-', '');
        else if (cleanNumber.startsWith('C')) cleanNumber = cleanNumber.replace('C', '');
        let cleanName = currentCaddie.name;
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
          ...g,
          caddie: {
            ...currentCaddie,
            number: cleanNumber,
            name: cleanName
          }
        };
      });

      localStorage.removeItem(draftGroupsKey);
      setPlayers(savedTournament.players || []);
      setTournamentInfo(savedTournament);
      setFlightGroups(normalizedGroups);
      setActiveGroupIndex(0);
      setIsAllGroupsView(false);
      setIsGroupsLocked(true);
      localStorage.setItem('active_tournament', JSON.stringify({
        info: savedTournament,
        players: savedTournament.players,
        groups: normalizedGroups,
        publishedAt: savedTournament.publishedAt,
        groupsLocked: true
      }));
    } catch (err) {
      console.error('Error activating groups:', err);
      alert('Gagal Activate group.');
    }
  };

  const downloadQR = (playerName: string) => {
    const canvas = document.getElementById('player-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${playerName.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    }
  };

  const openQRModal = (player: any) => {
    setSelectedPlayerForQR(player);
    setIsQRModalOpen(true);
  };

  const groupColors = [
    { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', accent: 'bg-blue-600', hover: 'hover:bg-blue-100/50' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', accent: 'bg-emerald-600', hover: 'hover:bg-emerald-100/50' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', accent: 'bg-amber-600', hover: 'hover:bg-amber-100/50' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', accent: 'bg-rose-600', hover: 'hover:bg-rose-100/50' },
    { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', accent: 'bg-indigo-600', hover: 'hover:bg-indigo-100/50' },
    { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', accent: 'bg-cyan-600', hover: 'hover:bg-cyan-100/50' },
    { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', accent: 'bg-violet-600', hover: 'hover:bg-violet-100/50' },
  ];

  useEffect(() => {
    setActiveGroupIndex(prev => {
      if (flightGroups.length <= 0) return 0;
      return Math.min(prev, flightGroups.length - 1);
    });
  }, [flightGroups.length]);

  const safeActiveGroupIndex = flightGroups.length > 0 ? Math.min(activeGroupIndex, flightGroups.length - 1) : 0;
  const activeGroup = flightGroups[safeActiveGroupIndex];
  const activeGroupColor = groupColors[safeActiveGroupIndex % groupColors.length];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-3 sm:p-4 lg:p-6 font-sans">
      <div className="w-full">
        {/* Simple Header */}
        <div className="sticky top-16 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/95 backdrop-blur p-5 sm:p-6 lg:p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800 uppercase italic tracking-tight">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users className="text-blue-600" size={28} />
              </div>
              {tournamentInfo?.name || 'Tournament Players'}
            </h1>
            <div className="flex items-center gap-4 text-slate-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em] ml-1">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <MapPin size={12} className="text-rose-500" />
                <span>{tournamentInfo?.course || currentAdminLocation}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Trophy size={12} className="text-blue-500" />
                <span>{tournamentInfo?.rules} • {tournamentInfo?.scoringMethod}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all w-full sm:w-72 text-sm font-bold text-slate-700"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
              <div className="pl-2 pr-1 text-slate-400">
                <Filter size={18} />
              </div>
              <button
                onClick={() => {
                  setFlightFilter('ALL');
                  setIsAllGroupsView(false);
                  setActiveGroupIndex(0);
                  setIsFilterResultsView(true);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  flightFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                All
              </button>
              {flights.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFlightFilter(f.id as 'A' | 'B' | 'C');
                    setIsAllGroupsView(false);
                    setActiveGroupIndex(0);
                    setIsFilterResultsView(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    flightFilter === f.id ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
            
            <div className="h-10 w-px bg-slate-200 mx-2" />

            <button 
              onClick={downloadExcelTemplate}
              className="bg-white hover:bg-slate-50 text-slate-600 p-3 rounded-2xl transition-all active:scale-95 group relative border border-slate-200 shadow-sm"
              title="Download Template Excel"
            >
              <Download size={20} />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv,.tsv,.txt" 
              className="hidden" 
            />
            
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 group shadow-xl shadow-blue-600/20"
              title="Import Data Excel"
            >
              <Upload size={18} />
              <span className="text-xs font-black uppercase tracking-widest hidden lg:block">Import TSV</span>
            </button>
            {players.length > 0 && (
              <button 
                onClick={deleteAllPlayers}
                className="bg-white hover:bg-rose-50 text-rose-500 p-3 rounded-2xl transition-all border border-slate-200 active:scale-95 group shadow-sm"
                title="Delete All Data"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Flight Groups Sections */}
        <div className="space-y-12">
          {isFilterResultsView ? (
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
                    {flightFilter === 'ALL' ? 'All Players' : `Flight ${flightFilter}`}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                    Total: {filteredPlayers.length} pemain
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsFilterResultsView(false);
                    setFlightFilter('ALL');
                  }}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  Kembali ke Group
                </button>
              </div>

              {flightFilter === 'ALL' && isGroupsLocked && flightGroups.length > 0 ? (
                <div className="space-y-6">
                  {flightGroups.map((g: any, gIdx: number) => {
                    const groupPlayers = (g?.players || []).filter((p: any) =>
                      (p?.name || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (p?.handicap ?? '').toString().includes(searchTerm)
                    );

                    if (groupPlayers.length === 0) return null;

                    return (
                      <div key={g.id || gIdx} className="rounded-[32px] border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between gap-4 px-8 py-5 bg-slate-50 border-b border-slate-200">
                          <div className="min-w-0">
                            <div className="font-black text-slate-800 uppercase italic tracking-tight truncate">
                              {g?.name || `FLIGHT ${gIdx + 1}`}
                            </div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                              {g?.code || '-'}
                            </div>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 shrink-0">
                            {groupPlayers.length} pemain
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[900px]">
                            <thead className="bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                              <tr>
                                <th className="px-8 py-4">No</th>
                                <th className="px-8 py-4">Player</th>
                                <th className="px-8 py-4 text-center">Flight</th>
                                <th className="px-8 py-4">Phone</th>
                                <th className="px-8 py-4">Email</th>
                                <th className="px-8 py-4 text-center">Shirt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                              {groupPlayers.map((p: any, idx: number) => (
                                <tr key={p.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-8 py-4 text-xs font-black text-slate-500">{idx + 1}</td>
                                  <td className="px-8 py-4">
                                    <div className="font-black text-slate-800 uppercase italic tracking-tight">
                                      {p.name || 'Unnamed Player'}
                                    </div>
                                  </td>
                                  <td className="px-8 py-4 text-center">
                                    <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                                      {p.flight || '-'}
                                    </span>
                                  </td>
                                  <td className="px-8 py-4 text-xs font-bold text-slate-700">{p.phone || '-'}</td>
                                  <td className="px-8 py-4 text-xs font-bold text-slate-700">{p.email || '-'}</td>
                                  <td className="px-8 py-4 text-center">
                                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest">
                                      {p.shirtSize || '-'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5">No</th>
                        <th className="px-8 py-5">Player</th>
                        <th className="px-8 py-5 text-center">Flight</th>
                        <th className="px-8 py-5">Phone</th>
                        <th className="px-8 py-5">Email</th>
                        <th className="px-8 py-5 text-center">Shirt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {filteredPlayers.map((p: any, idx: number) => (
                        <tr key={p.id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 text-xs font-black text-slate-500">{idx + 1}</td>
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-800 uppercase italic tracking-tight">
                              {p.name || 'Unnamed Player'}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                              {p.flight || '-'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-700">{p.phone || '-'}</td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-700">{p.email || '-'}</td>
                          <td className="px-8 py-5 text-center">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest">
                              {p.shirtSize || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : flightGroups.length > 0 ? (
            isAllGroupsView ? (
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Semua Group</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                      Klik salah satu group untuk melihat detail pemain per group
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isGroupsLocked && (
                      <>
                        <button
                          onClick={handleRegenerateGroups}
                          className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-slate-200 shadow-sm"
                        >
                          _
                        </button>
                        <button
                          onClick={handleActivateGroups}
                          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
                        >
                          Activate
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsAllGroupsView(false)}
                      className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                      Kembali
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5">No</th>
                        <th className="px-8 py-5">Group</th>
                        <th className="px-8 py-5">Code</th>
                        <th className="px-8 py-5 text-center">Flight</th>
                        <th className="px-8 py-5 text-center">Players</th>
                        <th className="px-8 py-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {flightGroups.map((g: any, idx: number) => (
                        <tr key={g.id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 text-xs font-black text-slate-500">{idx + 1}</td>
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-800 uppercase italic tracking-tight">
                              {g?.name || `FLIGHT ${idx + 1}`}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                              <QrCode size={14} />
                              {g?.code}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              {g?.flightType || '-'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center text-xs font-black text-slate-700">
                            {(g?.players || []).length}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button
                              onClick={() => {
                                setActiveGroupIndex(idx);
                                setIsAllGroupsView(false);
                              }}
                              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div key={activeGroup?.id || safeActiveGroupIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(() => {
                  const group = activeGroup;
                  const gIdx = safeActiveGroupIndex;
                  const color = activeGroupColor;
                  const isRevealed = isGroupsLocked || !!revealedGroups[gIdx];
                  const groupPlayers = (group?.players || []).filter((p: any) =>
                    (p?.name || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (p?.handicap ?? '').toString().includes(searchTerm)
                  );
                  const displayPlayers = isRevealed ? groupPlayers : [];

                  const canPrev = gIdx > 0;
                  const isLast = gIdx === flightGroups.length - 1;
                  const canNext = gIdx < flightGroups.length - 1;

                  const prevLabel = `BACK: FLIGHT ${gIdx}`;
                  const nextLabel = isLast ? 'FINISH' : `NEXT: FLIGHT ${gIdx + 2}`;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-6 ml-1 gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-1.5 h-8 rounded-full ${color.accent}`} />
                          <div className="flex items-center gap-3 min-w-0">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 truncate">
                              {group?.name || `FLIGHT ${gIdx + 1}`}
                            </h2>
                            <div className={`flex items-center gap-2 ${color.bg} ${color.text} px-3 py-1 rounded-xl border ${color.border} shadow-sm`}>
                              <QrCode size={14} />
                              <span className="text-xs font-black tracking-widest uppercase">
                                {group?.code}
                              </span>
                            </div>
                            {isGroupsLocked && (
                              <span className="px-3 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="hidden md:flex gap-2">
                            {(group?.flightType || '').split('+').filter(Boolean).map((f: string) => (
                              <span key={f} className="text-[9px] font-black text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm uppercase tracking-[0.2em]">
                                Flight {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => {
                              setIsAllGroupsView(false);
                              setActiveGroupIndex(prev => Math.max(0, prev - 1));
                            }}
                            disabled={!canPrev}
                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm ${
                              canPrev
                                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 active:scale-95'
                                : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            }`}
                          >
                            <ChevronLeft size={16} />
                            {prevLabel}
                          </button>

                          <div className="px-3 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {gIdx + 1}/{flightGroups.length}
                          </div>

                          {!isGroupsLocked && !isRevealed && (
                            <button
                              onClick={() => setRevealedGroups(prev => ({ ...prev, [gIdx]: true }))}
                              className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm bg-blue-600 hover:bg-blue-700 text-white border-blue-600 active:scale-95"
                            >
                              GENERATE FLIGHT {gIdx + 1}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (isLast) {
                                setIsAllGroupsView(true);
                                return;
                              }
                              setIsAllGroupsView(false);
                              setActiveGroupIndex(prev => Math.min(flightGroups.length - 1, prev + 1));
                            }}
                            disabled={!canNext && !isLast}
                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm ${
                              isLast
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 active:scale-95 shadow-xl shadow-emerald-600/20'
                                : canNext
                                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 active:scale-95'
                                  : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            }`}
                          >
                            {nextLabel}
                            <ChevronRight size={16} />
                          </button>

                          {!isGroupsLocked && (
                            <>
                              <button
                                onClick={handleRegenerateGroups}
                                className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 active:scale-95"
                              >
                                _
                              </button>
                              <button
                                onClick={handleActivateGroups}
                                className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 active:scale-95 shadow-xl shadow-emerald-600/20"
                              >
                                Activate
                              </button>
                            </>
                          )}

                        </div>
                      </div>

                      {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayPlayers.map((player: any, playerIdx: number) => (
                        <div key={player.id} className="bg-white border border-slate-200 rounded-[32px] p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/5 transition-all group relative overflow-hidden shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <User size={24} />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex gap-2">
                                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">FLIGHT {player.flight || '-'}</span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 mt-2">
                                <button 
                                  onClick={() => openQRModal(player)}
                                  className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all p-2 rounded-lg border border-slate-200 shadow-sm"
                                  title="View QR Code"
                                >
                                  <QrCode size={16} />
                                </button>
                                <button 
                                  onClick={() => deletePlayer(player.id)}
                                  className="bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all p-2 rounded-lg border border-slate-200 shadow-sm"
                                  title="Delete Player"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
                                {playerIdx + 1}
                              </span>
                              <h3 className="font-black text-base text-slate-800 truncate uppercase italic tracking-tight">{player.name || 'Unnamed Player'}</h3>
                              <button
                                onClick={() => openQRModal({ ...player, code: group.code })}
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200 shadow-sm"
                                title="View QR Code"
                              >
                                <QrCode size={16} />
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{player.email || 'no-email@example.com'}</p>
                          </div>
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Shirt</span>
                                <span className="text-xs font-black text-slate-600">{player.shirtSize}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users size={12} className="text-blue-500" />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{group.caddie?.number || '000'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{player.phone || '-'}</span>
                              <span className="text-[9px] font-bold text-slate-400 italic truncate max-w-[100px]">{group.caddie?.name || 'Unassigned'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[800px]">
                          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                            <tr>
                              <th className="px-8 py-5">Player Name</th>
                              <th className="px-8 py-5 text-center">Flight</th>
                              <th className="px-8 py-5">Contact Info</th>
                              <th className="px-8 py-5 text-center">Shirt</th>
                              <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-700">
                            {displayPlayers.map((player: any, playerIdx: number) => (
                              <tr key={player.id} className="hover:bg-slate-50/50 transition-colors cursor-default group">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
                                          {playerIdx + 1}
                                        </span>
                                        <span className="font-black text-slate-800 uppercase italic tracking-tight block">{player.name || 'Unnamed Player'}</span>
                                        <button 
                                          onClick={() => openQRModal({ ...player, code: group.code })}
                                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200 shadow-sm"
                                          title="View QR Code"
                                        >
                                          <QrCode size={16} />
                                        </button>
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{player.email || '-'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                  <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">{player.flight || '-'}</span>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-xs font-bold text-slate-700">{player.phone || '-'}</div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest">
                                    {player.shirtSize}
                                  </span>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      className="text-blue-500 hover:bg-blue-50 p-2.5 rounded-xl transition-all active:scale-90 border border-transparent hover:border-blue-100"
                                      title="Edit Player"
                                      onClick={() => {
                                        setEditingPlayer(player);
                                        setIsEditModalOpen(true);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                    <button 
                                      onClick={() => deletePlayer(player.id)}
                                      className="text-slate-300 hover:text-rose-500 p-2.5 rounded-xl transition-all active:scale-90 border border-transparent hover:border-rose-100"
                                      title="Delete Player"
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                    </>
                  );
                })()}
              </div>
            )
          ) : players.length > 0 ? (
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 animate-in fade-in duration-500">
              <div className="flex items-start justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Players Imported</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                    Auto-grouping ditiadakan dulu. Klik tombol di kanan untuk generate/kocok group.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateDraftGroups}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
                  >
                    Generate Group
                  </button>
                  <button
                    onClick={openManualGroupModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                  >
                    Generate Group Manual
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Player</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Flight</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phone</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((p: any, idx: number) => (
                      <tr key={p.id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-xs font-black text-slate-500">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{p.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            Flight {p.flight}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">{p.phone || '-'}</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">{p.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                <AlertCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter italic">No Active Tournament</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Please create or import a tournament to begin</p>
              <button 
                onClick={() => navigate('/admin/rounds/create-tournament')}
                className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center gap-3"
              >
                <Plus size={20} />
                Create New Tournament
              </button>
            </div>
          )}
        </div>
      </div>

      {isManualGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Generate Group Manual</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                  Tentukan nama player untuk tiap FLIGHT secara manual (3-8 player per flight)
                </p>
              </div>
              <button
                onClick={() => setIsManualGroupModalOpen(false)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-50 rounded-[28px] border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1">
                    <input
                      value={manualGroupSearch}
                      onChange={(e) => setManualGroupSearch(e.target.value)}
                      placeholder="Search player..."
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <select
                    value={manualGroupFlightFilter}
                    onChange={(e) => setManualGroupFlightFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-black text-[11px] uppercase tracking-widest text-slate-700"
                  >
                    <option value="ALL">All</option>
                    <option value="A">Flight A</option>
                    <option value="B">Flight B</option>
                    <option value="C">Flight C</option>
                  </select>
                </div>

                <div className="h-[520px] overflow-y-auto pr-1 space-y-2">
                  {manualAvailablePlayers.length ? (
                    manualAvailablePlayers.map((p: any) => (
                      <button
                        key={toPlayerKey(p)}
                        type="button"
                        onClick={() => {
                          const currentCount = manualGroupsDraft[manualActiveGroupIndex]?.playerIds?.length || 0;
                          if (currentCount >= 8) {
                            alert('Maksimal 8 player per flight.');
                            return;
                          }
                          addPlayerToManualGroup(p);
                        }}
                        className="w-full flex items-center justify-between gap-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all rounded-2xl p-4 text-left"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{p.name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                              Flight {(p.flight || '-').toString().toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.phone || '-'}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                          <Plus size={18} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">No players found</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Unassigned: {manualUnassignedPlayers.length}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Total: {players.length}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {manualGroupsDraft.map((g, idx) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setManualActiveGroupIndex(idx)}
                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          idx === manualActiveGroupIndex
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        FLIGHT {idx + 1} <span className={`${idx === manualActiveGroupIndex ? 'text-white/80' : 'text-slate-400'}`}>({g.playerIds.length}/8)</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addManualFlight}
                      className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-2 active:scale-95"
                    >
                      <Plus size={16} />
                      Flight
                    </button>
                    <button
                      type="button"
                      onClick={() => removeManualFlight(manualActiveGroupIndex)}
                      disabled={manualGroupsDraft.length <= 1}
                      className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border bg-white hover:bg-rose-50 text-rose-600 border-slate-200 flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Flight Aktif</div>
                      <div className="text-2xl font-black uppercase italic tracking-tight text-slate-800 mt-1">
                        {manualActiveGroup?.name || `FLIGHT ${manualActiveGroupIndex + 1}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kapasitas</div>
                      <div className="text-sm font-black text-slate-700 mt-1">{manualActiveGroupPlayers.length}/4</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {manualActiveGroupPlayers.length ? (
                      manualActiveGroupPlayers.map((p: any, idx: number) => {
                        const key = toPlayerKey(p);
                        return (
                          <div key={key} className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{p.name}</span>
                                <span className="px-2 py-1 rounded-xl bg-white border border-slate-200 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                  Flight {(p.flight || '-').toString().toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePlayerFromManualGroup(key)}
                              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center text-slate-400 hover:text-rose-600 shrink-0"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 flex items-center justify-center">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pilih player dari kiri untuk menambahkan</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsManualGroupModalOpen(false)}
                    className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveManualGroups}
                    className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                  >
                    Gunakan Group Manual
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQRModalOpen && selectedPlayerForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-slate-800">{selectedPlayerForQR.name}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedPlayerForQR.code}</p>
                </div>
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl mb-6 flex flex-col items-center border border-slate-100">
                <QRCodeCanvas 
                  id="player-qr-canvas"
                  value={selectedPlayerForQR.code} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan to start scoring</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => downloadQR(selectedPlayerForQR.name)}
                  className="py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {isEditModalOpen && editingPlayer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Edit Player</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPlayer(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Pemain</label>
                <input 
                  type="text" 
                  value={editingPlayer.name || ''}
                  onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Handicap</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={editingPlayer.handicap || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const hcp = parseInt(val) || 0;
                      let flight = 'C';
                      if (hcp >= 1 && hcp <= 13) flight = 'A';
                      else if (hcp >= 14 && hcp <= 21) flight = 'B';
                      setEditingPlayer({...editingPlayer, handicap: val, flight});
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Flight</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-700 cursor-not-allowed">
                    {editingPlayer.flight || '-'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">No. HP</label>
                <input 
                  type="text" 
                  value={editingPlayer.phone || ''}
                  onChange={(e) => setEditingPlayer({...editingPlayer, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email" 
                  value={editingPlayer.email || ''}
                  onChange={(e) => setEditingPlayer({...editingPlayer, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPlayer(null);
                }}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleEditSave}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/30"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Import TSV</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tournament Basic Details</div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Name</label>
                  <input
                    type="text"
                    value={importTournamentInfo.name}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                  <input
                    type="date"
                    value={importTournamentInfo.date}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Course Location</label>
                  <input
                    type="text"
                    value={importTournamentInfo.course}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rules & Setup</div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tee Box</label>
                  <input
                    type="text"
                    value={importTournamentInfo.tee}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, tee: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tee Time</label>
                  <input
                    type="time"
                    value={importTournamentInfo.teeTime}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, teeTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rules</label>
                  <input
                    type="text"
                    value={importTournamentInfo.rules}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, rules: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Scoring Method</label>
                  <input
                    type="text"
                    value={importTournamentInfo.scoringMethod}
                    onChange={(e) => setImportTournamentInfo(prev => ({ ...prev, scoringMethod: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <Upload size={16} />
                Pilih File TSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPlayers;
