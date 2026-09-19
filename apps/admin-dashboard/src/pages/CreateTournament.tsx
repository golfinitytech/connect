import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Trophy, 
  Users, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Flag,
  Save,
  CheckCircle2,
  Download,
  Upload,
  MapPin
} from 'lucide-react';

const CreateTournament = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const currentAdminLocation = localStorage.getItem('adminLocation') || 'Palm Springs Karawang';
  const [caddiesMaster, setCaddiesMaster] = useState<any[]>([]);
  const [caddieAssignments, setCaddieAssignments] = useState<Record<number, { number: string, name: string }>>({});

  useEffect(() => {
    const savedCaddies = localStorage.getItem('golf_caddies_master');
    if (savedCaddies) {
      setCaddiesMaster(JSON.parse(savedCaddies));
    }
  }, []);
  
  // State for Step 1: Tournament Info
  const [tournamentInfo, setTournamentInfo] = useState({
    name: '',
    date: '',
    course: currentAdminLocation,
    tee: 'White',
    teeTime: '',
    rules: 'Stroke Play',
    scoringMethod: 'System 36'
  });

  // State for Step 2: Player Data
  const [players, setPlayers] = useState([
    { id: 1, name: '', dob: '', shirtSize: 'L', phone: '', email: '', handicap: '' }
  ]);

  // State for Step 3: Flight Grouping
  const [groupingMode, setGroupingMode] = useState<'auto' | 'manual'>('auto');
  const [manualGroups, setManualGroups] = useState<{ id: string; name: string; players: any[] }[]>([]);
  const [flights, setFlights] = useState([
    { id: 'A', label: 'Flight A', minHcp: 1, maxHcp: 13, description: 'Jika HCP 1-13' },
    { id: 'B', label: 'Flight B', minHcp: 14, maxHcp: 21, description: 'Jika HCP 14-21' },
    { id: 'C', label: 'Flight C', minHcp: 22, maxHcp: 28, description: 'Jika HCP 22-28' }
  ]);

  const addManualGroup = () => {
    setManualGroups([...manualGroups, { id: `group-${Date.now()}`, name: `FLIGHT ${manualGroups.length + 1}`, players: [] }]);
  };

  const removeManualGroup = (id: string) => {
    setManualGroups(manualGroups.filter(g => g.id !== id));
  };

  const addPlayerToManualGroup = (groupId: string, player: any) => {
    setManualGroups(manualGroups.map(g => {
      if (g.id === groupId && g.players.length < 8) {
        return { ...g, players: [...g.players, player] };
      }
      return g;
    }));
  };

  const removePlayerFromManualGroup = (groupId: string, playerId: number) => {
    setManualGroups(manualGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, players: g.players.filter(p => p.id !== playerId) };
      }
      return g;
    }));
  };

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now(), name: '', dob: '', shirtSize: 'L', phone: '', email: '', handicap: '' }]);
  };

  const removePlayer = (id: number) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayer = (id: number, field: string, value: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const downloadExcelTemplate = () => {
    const headers = ['Name', 'Handicap', 'DOB (YYYY-MM-DD)', 'Phone', 'Email', 'Shirt Size (S/M/L/XL/XXL)'];
    const samplePlayers = [];
    for (let i = 1; i <= 40; i++) {
      let hcp;
      if (i <= 15) hcp = 1 + Math.floor(Math.random() * 13);
      else if (i <= 30) hcp = 14 + Math.floor(Math.random() * 8);
      else hcp = 22 + Math.floor(Math.random() * 7);
      const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      const shirt = shirtSizes[Math.floor(Math.random() * shirtSizes.length)];
      samplePlayers.push(`Player ${i},${hcp},1985-01-${(i % 28 + 1).toString().padStart(2, '0')},081234567${i.toString().padStart(2, '0')},player${i}@example.com,${shirt}`);
    }
    const csvContent = [headers.join(','), ...samplePlayers].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tournament_players_40_sample.csv';
    link.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newPlayers: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [name, handicap, dob, phone, email, shirtSize] = line.split(',');
        if (name) {
          newPlayers.push({
            id: Date.now() + i,
            name: name.trim(),
            handicap: handicap?.trim() || '0',
            dob: dob?.trim() || '',
            phone: phone?.trim() || '',
            email: email?.trim() || '',
            shirtSize: shirtSize?.trim() || 'L'
          });
        }
      }
      if (newPlayers.length > 0) {
        setPlayers(newPlayers);
        alert(`Successfully imported ${newPlayers.length} players!`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center w-full max-w-3xl">
        {[
          { s: 1, label: 'Tournament Info', icon: Trophy },
          { s: 2, label: 'Player Data', icon: Users },
          { s: 3, label: 'Grouping Rules', icon: Layers }
        ].map((item, idx) => (
          <React.Fragment key={item.s}>
            <div className="flex flex-col items-center relative flex-1">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                step >= item.s ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white text-slate-300 border border-slate-100'
              }`}>
                <item.icon size={20} />
              </div>
              <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                step >= item.s ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`h-1 flex-1 mx-4 rounded-full transition-all duration-500 ${
                step > item.s ? 'bg-blue-600' : 'bg-slate-100'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const autoGroupPlayers = (playersList: any[]) => {
    const playersWithFlight = playersList.map(p => {
      const hcp = parseInt(p.handicap) || 0;
      let flight = 'C';
      if (hcp >= 1 && hcp <= 13) flight = 'A';
      else if (hcp >= 14 && hcp <= 21) flight = 'B';
      return { ...p, flight };
    });

    const playersA = playersWithFlight.filter(p => p.flight === 'A');
    const playersB = playersWithFlight.filter(p => p.flight === 'B');
    const playersC = playersWithFlight.filter(p => p.flight === 'C');

    const groups: any[][] = [];

    // 1. Group C (Must be separate, 2-4 players)
    let poolC = [...playersC];
    while (poolC.length > 0) {
      let size = Math.min(poolC.length, 4);
      if (poolC.length === 5) size = 3; // Split 5 into 3 and 2
      
      // Handle the "1 player left" case
      if (poolC.length === 1 && groups.length > 0) {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup.length > 2) {
          // Take one from last group to make a group of 2
          const borrowedPlayer = lastGroup.pop();
          groups.push([borrowedPlayer, poolC.shift()]);
          continue;
        } else {
          // Last group only has 2, make it a group of 3
          lastGroup.push(poolC.shift());
          continue;
        }
      }
      
      groups.push(poolC.splice(0, size));
    }

    // 2. Group A & B (Can mix, 2-4 players)
    // Rule: NO 3xA + 1xB
    let poolAB = [...playersA, ...playersB];
    poolAB.sort((a, b) => (a.flight === 'B' ? -1 : 1));

    while (poolAB.length > 0) {
      let size = Math.min(poolAB.length, 4);
      if (poolAB.length === 5) size = 3;

      // Handle the "1 player left" case for AB
      if (poolAB.length === 1 && groups.length > 0) {
        // Find a group that is NOT purely Flight C
        const lastABGroupIndex = [...groups].reverse().findIndex(g => g[0].flight !== 'C');
        if (lastABGroupIndex !== -1) {
          const actualIndex = groups.length - 1 - lastABGroupIndex;
          const lastABGroup = groups[actualIndex];
          if (lastABGroup.length > 2) {
            const borrowedPlayer = lastABGroup.pop();
            groups.push([borrowedPlayer, poolAB.shift()]);
          } else {
            lastABGroup.push(poolAB.shift());
          }
          continue;
        }
      }

      let currentGroup = poolAB.slice(0, size);
      const countA = currentGroup.filter(p => p.flight === 'A').length;
      const countB = currentGroup.filter(p => p.flight === 'B').length;

      // Check forbidden 3xA + 1xB
      if (size === 4 && countA === 3 && countB === 1) {
        // Try to find another B in the pool to swap with one A
        const poolBIndex = poolAB.findIndex((p, i) => i >= size && p.flight === 'B');
        if (poolBIndex !== -1) {
          // Swap
          const aIndexInGroup = currentGroup.findIndex(p => p.flight === 'A');
          const aPlayer = poolAB[aIndexInGroup];
          poolAB[aIndexInGroup] = poolAB[poolBIndex];
          poolAB[poolBIndex] = aPlayer;
          currentGroup = poolAB.slice(0, size);
        } else {
          // No more B's. Must split the group to avoid 3xA+1xB.
          // Use size 3 (which would be 3xA or 2xA+1xB - both OK)
          size = 3;
          currentGroup = poolAB.slice(0, size);
        }
      }

      groups.push(poolAB.splice(0, size));
    }

    return groups;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/admin/rounds')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group border border-slate-200 shadow-sm"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic text-slate-800">Create Tournament</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-0.5">Step {step} of 3 • {currentAdminLocation}</p>
            </div>
          </div>
          {step === 3 && (
            <button 
              onClick={() => setShowSummaryModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-white"
            >
              <Save size={20} />
              Publish Tournament
            </button>
          )}
        </div>

        {renderStepIndicator()}

        {/* Step 1: Tournament Info */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Trophy size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-black uppercase italic text-slate-800">Basic Details</h2>
              </div>
              <div className="space-y-3">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Tournament Name</label>
                <input 
                  type="text" 
                  value={tournamentInfo.name}
                  onChange={(e) => setTournamentInfo({...tournamentInfo, name: e.target.value})}
                  placeholder={`e.g. ${currentAdminLocation} Cup ${new Date().getFullYear()}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-8 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 text-lg placeholder:text-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="date" 
                      value={tournamentInfo.date}
                      onChange={(e) => setTournamentInfo({...tournamentInfo, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Course Location</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 font-bold flex items-center gap-2">
                    <MapPin size={16} className="text-rose-500" />
                    {tournamentInfo.course}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                  <Flag size={20} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-black uppercase italic text-slate-800">Rules & Setup</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Tee Box</label>
                  <div className="relative">
                    <Flag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select 
                      value={tournamentInfo.tee}
                      onChange={(e) => setTournamentInfo({...tournamentInfo, tee: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-500 transition-all appearance-none font-bold text-slate-800"
                    >
                      <option>Black</option>
                      <option>Blue</option>
                      <option>White</option>
                      <option>Red</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Tee Time</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="time" 
                      value={tournamentInfo.teeTime}
                      onChange={(e) => setTournamentInfo({...tournamentInfo, teeTime: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Rules</label>
                  <select 
                    value={tournamentInfo.rules}
                    onChange={(e) => setTournamentInfo({...tournamentInfo, rules: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all appearance-none font-bold text-slate-800"
                  >
                    <option>Stroke Play</option>
                    <option>Match Play</option>
                    <option>Stableford</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Scoring Method</label>
                  <select 
                    value={tournamentInfo.scoringMethod}
                    onChange={(e) => setTournamentInfo({...tournamentInfo, scoringMethod: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all appearance-none font-bold text-slate-800"
                  >
                    <option>System 36</option>
                    <option>Peoria</option>
                    <option>Double Peoria</option>
                    <option>Callaway</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Player Data */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Player Registration List</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Players: {players.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={downloadExcelTemplate}
                  className="bg-white border border-slate-200 text-slate-500 hover:text-blue-600 p-4 rounded-2xl transition-all active:scale-95 group relative shadow-sm hover:border-blue-200"
                  title="Download Template (40 Players)"
                >
                  <Download size={24} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-200 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                  <Upload size={20} /> Import CSV
                </button>
                <button 
                  onClick={addPlayer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                >
                  <Plus size={20} /> Add Player
                </button>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-10 py-5">#</th>
                    <th className="px-10 py-5">Player Name</th>
                    <th className="px-10 py-5">DOB</th>
                    <th className="px-10 py-5">Shirt</th>
                    <th className="px-10 py-5">Contact Info</th>
                    <th className="px-4 py-5 text-center">HCP</th>
                    <th className="px-10 py-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {players.map((player, index) => (
                    <tr key={player.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6 text-slate-300 font-black text-lg italic">{index + 1}</td>
                      <td className="px-10 py-6">
                        <input 
                          type="text" 
                          value={player.name}
                          onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                          placeholder="Player Name"
                          className="bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none w-full font-black text-slate-800 uppercase italic tracking-tight transition-all placeholder:text-slate-200"
                        />
                      </td>
                      <td className="px-10 py-6">
                        <input 
                          type="date" 
                          value={player.dob}
                          onChange={(e) => updatePlayer(player.id, 'dob', e.target.value)}
                          className="bg-transparent outline-none w-full text-xs font-bold text-slate-600"
                        />
                      </td>
                      <td className="px-10 py-6">
                        <select 
                          value={player.shirtSize}
                          onChange={(e) => updatePlayer(player.id, 'shirtSize', e.target.value)}
                          className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-black text-[10px] text-slate-500 uppercase tracking-widest"
                        >
                          {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-10 py-6 space-y-2">
                        <input 
                          type="text" 
                          value={player.phone}
                          onChange={(e) => updatePlayer(player.id, 'phone', e.target.value)}
                          placeholder="Phone Number"
                          className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full text-[10px] font-black tracking-widest transition-all text-slate-600 uppercase"
                        />
                        <input 
                          type="email" 
                          value={player.email}
                          onChange={(e) => updatePlayer(player.id, 'email', e.target.value)}
                          placeholder="Email Address"
                          className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full text-[10px] font-bold text-slate-400 transition-all lowercase"
                        />
                      </td>
                      <td className="px-4 py-6 w-28">
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={player.handicap}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              updatePlayer(player.id, 'handicap', val);
                            }}
                            className="bg-blue-50 border border-blue-100 rounded-xl py-2 px-1 w-full text-center font-black text-blue-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg"
                            placeholder="0"
                          />
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <button 
                          onClick={() => removePlayer(player.id)}
                          className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                        >
                          <Trash2 size={24} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Flight Grouping Rules */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Mode Selection */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2 border border-slate-200">
                <button
                  onClick={() => setGroupingMode('auto')}
                  className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    groupingMode === 'auto' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Auto-Grouping
                </button>
                <button
                  onClick={() => {
                    setGroupingMode('manual');
                    if (manualGroups.length === 0) {
                      addManualGroup();
                    }
                  }}
                  className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    groupingMode === 'manual' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Manual Grouping
                </button>
              </div>
            </div>

            {groupingMode === 'auto' ? (
              <>
                {/* Rules Summary Card */}
                <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                      <Layers className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase italic tracking-widest text-slate-800">Auto-Grouping Rules</h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sistem akan membagi pemain secara otomatis</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "Flight A (HCP 1-13) & B (HCP 14-21) boleh satu flight",
                      "Flight C (HCP 22-28) harus terpisah dari A & B",
                      "Flight C hanya boleh dengan sesama Flight C",
                      "TIDAK BOLEH: 1 orang Flight B & 3 orang Flight A",
                      "BOLEH: 1 orang Flight A & 3 orang Flight B",
                      "Minimal 2 orang & Maksimal 4 orang per flight"
                    ].map((rule, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 leading-relaxed">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Categories Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {flights.map((flight) => (
                    <div key={flight.id} className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-6 relative group overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                          <span className="text-xl font-black text-blue-600">{flight.id}</span>
                        </div>
                        <div className="text-right">
                          <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-800">{flight.label}</h3>
                          <p className="text-[10px] font-bold text-blue-600/60 uppercase">HCP {flight.minHcp}-{flight.maxHcp}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-600">Total Players</span>
                          <span className="text-[10px] font-black text-slate-400">
                            {players.filter(p => {
                              const hcp = parseInt(p.handicap);
                              return !isNaN(hcp) && hcp >= flight.minHcp && hcp <= flight.maxHcp;
                            }).length} Registered
                          </span>
                        </div>
                        
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                          {players
                            .filter(p => {
                              const hcp = parseInt(p.handicap);
                              return !isNaN(hcp) && hcp >= flight.minHcp && hcp <= flight.maxHcp;
                            })
                            .map(p => (
                              <div key={p.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-700 truncate">{p.name || 'Unnamed Player'}</span>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">HCP {p.handicap}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                      <Users className="text-emerald-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase italic tracking-widest text-slate-800">Manual Grouping</h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tempatkan pemain secara manual ke dalam grup</p>
                    </div>
                  </div>
                  <button 
                    onClick={addManualGroup}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Plus size={16} /> Add Flight
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 bg-slate-50 rounded-[24px] border border-slate-200 p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Unassigned Players</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {players.filter(p => !manualGroups.some(g => g.players.find(gp => gp.id === p.id))).map(p => (
                        <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-[11px] font-black text-slate-800 truncate">{p.name || 'Unnamed Player'}</div>
                            <div className="text-[9px] font-bold text-slate-400">HCP {p.handicap || 0}</div>
                          </div>
                          <div className="flex gap-1 overflow-x-auto">
                            {manualGroups.map(g => (
                              <button
                                key={g.id}
                                onClick={() => addPlayerToManualGroup(g.id, p)}
                                disabled={g.players.length >= 8}
                                className={`text-[8px] font-black px-2 py-1 rounded border ${
                                  g.players.length >= 8 
                                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                }`}
                              >
                                {g.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {manualGroups.map((g, index) => (
                        <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <div>
                              <input 
                                type="text"
                                value={g.name}
                                onChange={(e) => setManualGroups(manualGroups.map(mg => mg.id === g.id ? { ...mg, name: e.target.value } : mg))}
                                className="font-black text-sm uppercase italic tracking-tight text-slate-800 outline-none w-full bg-transparent"
                              />
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {g.players.length}/8 Players
                              </div>
                            </div>
                            <button 
                              onClick={() => removeManualGroup(g.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="space-y-2 min-h-[120px]">
                            {g.players.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic py-8">
                                Empty Flight
                              </div>
                            ) : (
                              g.players.map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-black text-slate-700 truncate">{p.name || 'Unnamed Player'}</div>
                                    <div className="text-[8px] font-bold text-slate-400">HCP {p.handicap || 0}</div>
                                  </div>
                                  <button 
                                    onClick={() => removePlayerFromManualGroup(g.id, p.id)}
                                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-end">
          {step < 3 && (
            <button 
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              Continue to {step === 1 ? 'Player Data' : 'Flight Grouping'}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Tournament Publication Summary</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Review all data before finalizing</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {/* Basic Info Summary */}
              <div className="grid grid-cols-4 gap-6">
                <SummaryItem label="Tournament Name" value={tournamentInfo.name} />
                <SummaryItem label="Date" value={tournamentInfo.date} />
                <SummaryItem label="Course" value={tournamentInfo.course} />
                <SummaryItem label="Tee Box" value={tournamentInfo.tee} />
                <SummaryItem label="Rules" value={tournamentInfo.rules} />
                <SummaryItem label="Scoring" value={tournamentInfo.scoringMethod} />
                <SummaryItem label="Tee Time" value={tournamentInfo.teeTime} />
                <SummaryItem label="Total Players" value={players.length.toString()} />
              </div>

              <div className="h-px bg-slate-100" />

              {/* Groups Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                  {groupingMode === 'auto' ? 'Auto-Generated Flight Groups' : 'Manual Flight Groups'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(groupingMode === 'auto' ? autoGroupPlayers(players) : manualGroups.map(g => g.players)).map((group, gIdx) => (
                    <div key={gIdx} className="bg-slate-50 rounded-[24px] p-5 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-black text-white">{gIdx + 1}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {groupingMode === 'auto' ? `Group ${gIdx + 1}` : manualGroups[gIdx].name}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from(new Set(group.map(p => p.flight))).map(f => (
                            <span key={f} className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600">FLIGHT {f}</span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {group.map((p, pIdx) => (
                          <div key={pIdx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{p.name || 'Unnamed'}</span>
                            <span className="text-[9px] font-black text-slate-400">HCP {p.handicap}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <label className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1.5 block">Assign Caddie</label>
                        <div className="flex gap-2">
                          <select 
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                            value={caddieAssignments[gIdx] ? `${caddieAssignments[gIdx].number}|${caddieAssignments[gIdx].name}` : ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const [no, name] = val.split('|');
                                setCaddieAssignments(prev => ({
                                  ...prev,
                                  [gIdx]: { number: no, name: name }
                                }));
                              } else {
                                setCaddieAssignments(prev => {
                                  const newState = { ...prev };
                                  delete newState[gIdx];
                                  return newState;
                                });
                              }
                            }}
                          >
                            <option value="">Select Caddie</option>
                            {caddiesMaster.map((c: any) => (
                              <option key={c.id} value={`${c.name}|${c.searchedName}`}>
                                {c.name} - {c.searchedName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="text-[8px] text-slate-400 mt-2 italic">* Pilih caddie yang akan memasukkan no group di tablet</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
              >
                Back to Edit
              </button>
              <button 
                onClick={async () => {
                  try {
                    const currentYear = new Date().getFullYear();
                    const generatedGroups = groupingMode === 'auto' ? autoGroupPlayers(players) : manualGroups.map(g => g.players);
                    
                    // Generate unique codes for EACH GROUP
                    const groupsWithCodes = generatedGroups.map((group, index) => {
                      const sequence = (index + 1).toString().padStart(2, '0');
                      const code = `GF-OPEN-${currentYear}-${sequence}`;
                      
                      // Ambil data caddie dari state assignments
                      const assignedCaddie = caddieAssignments[index];
                      let caddieNo = assignedCaddie?.number || sequence;
                      let caddieName = assignedCaddie?.name || 'Unassigned';

                      // Sanitize: Strip 'C-' or 'C' if it exists in the number
                      caddieNo = caddieNo.toString();
                      if (caddieNo.startsWith('C-')) caddieNo = caddieNo.replace('C-', '');
                      else if (caddieNo.startsWith('C')) caddieNo = caddieNo.replace('C', '');

                      // Auto-lookup name from master if still Unassigned
                      if (caddieName === 'Unassigned') {
                        const masterCaddie = caddiesMaster.find((c: any) => c.name === caddieNo);
                        if (masterCaddie) {
                          caddieName = masterCaddie.searchedName;
                        }
                      }

                      return {
                        id: `group-${index + 1}`,
                        code,
                        name: groupingMode === 'auto' ? `Group ${index + 1}` : manualGroups[index].name, // Nama Group untuk UI
                        players: group,
                        flightType: Array.from(new Set(group.map(p => p.flight))).join('+'),
                        caddie: {
                          number: caddieNo,
                          name: caddieName
                        }
                      };
                    });

                    const tournamentData = {
                      info: tournamentInfo,
                      players: players.map(p => {
                        const hcp = parseInt(p.handicap) || 0;
                        let flight = 'C';
                        if (hcp >= 1 && hcp <= 13) flight = 'A';
                        else if (hcp >= 14 && hcp <= 21) flight = 'B';
                        return { ...p, flight };
                      }),
                      groups: groupsWithCodes,
                      publishedAt: new Date().toISOString()
                    };
                    
                    // Save to MySQL via API
                    await api.post('/tournaments', { ...tournamentData, archivePrevious: true });
                    
                    // Keep a copy in localStorage for immediate UI updates if needed, 
                    // but the primary source will now be the API.
                    localStorage.setItem('active_tournament', JSON.stringify(tournamentData));
                    
                    // Clear existing sessions
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('tournament_scores_') || key === 'tournament_session') {
                        localStorage.removeItem(key);
                      }
                    });

                    alert('Tournament Successfully Published to Database with ' + groupsWithCodes.length + ' Flight Groups!');
                    navigate('/admin/rounds/tournament-players');
                  } catch (error) {
                    console.error('Error publishing tournament:', error);
                    alert('Failed to publish tournament to database. Please check your connection.');
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryItem = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</span>
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 truncate">
      {value || '-'}
    </div>
  </div>
);

export default CreateTournament;
