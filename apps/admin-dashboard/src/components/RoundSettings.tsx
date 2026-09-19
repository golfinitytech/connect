import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronDown, 
  RotateCcw, 
  ArrowUpDown,
  User,
  Phone,
  Flag,
  Info
} from 'lucide-react';
import CaddieSelectionModal from './CaddieSelectionModal';
import CourseSelectionModal from './CourseSelectionModal';
import HoleSelectionModal from './HoleSelectionModal';
import CartSelectionModal from './CartSelectionModal';
import PlayerScoreInputModal from './PlayerScoreInputModal';
import PhoneInputModal from './PhoneInputModal';
import TimeSelectionModal from './TimeSelectionModal';

import HCPSettingsModal from './HCPSettingsModal';
import TeeBoxSelectionModal from './TeeBoxSelectionModal';
import CustomerSelectionModal from './CustomerSelectionModal';
import type { TeeBoxColor } from './TeeBoxSelectionModal';

interface RoundSettingsProps {
  onBack: () => void;
  onReset?: () => void;
}

const RoundSettings = ({ onBack, onReset: onResetProp }: RoundSettingsProps) => {
  const [groupName, setGroupName] = useState(() => localStorage.getItem('golf_group_name') || '');
  const [isFivePlayers, setIsFivePlayers] = useState(() => JSON.parse(localStorage.getItem('golf_is_five_players') || 'false'));
  const [isCaddieModalOpen, setIsCaddieModalOpen] = useState(false);
  const [currentCaddieSlot, setCurrentCaddieSlot] = useState<0 | 1>(0);
  const [selectedCaddies, setSelectedCaddies] = useState<string[]>(() => {
    const saved = localStorage.getItem('golf_selected_caddies');
    if (saved) return JSON.parse(saved);
    
    const initialCaddieCode = localStorage.getItem('caddieCode');
    if (initialCaddieCode) return [initialCaddieCode, ""];

    // Default fallback from master data
    const savedMaster = localStorage.getItem('golf_caddies_master');
    if (savedMaster) {
      const parsed = JSON.parse(savedMaster);
      if (parsed.length > 0) return [parsed[0].name, ""];
    }
    return ["305", ""];
  });
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [currentCourseSlot, setCurrentCourseSlot] = useState<'OUT' | 'IN'>('OUT');
  const [selectedCourses, setSelectedCourses] = useState(() => JSON.parse(localStorage.getItem('golf_selected_courses') || '{"OUT": "IN", "IN": "OUT"}'));
  const [isHoleModalOpen, setIsHoleModalOpen] = useState(false);
  const [selectedStartingHole, setSelectedStartingHole] = useState(() => localStorage.getItem('golf_starting_hole') || '18');
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [timeModalType, setTimeModalType] = useState<'hour' | 'minute'>('hour');
  const [selectedTeeOffTime, setSelectedTeeOffTime] = useState(() => JSON.parse(localStorage.getItem('golf_tee_off_time') || '{"hour": "08", "minute": "32"}'));
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState(() => localStorage.getItem('golf_selected_cart') || '70');
  const [isPlayerScoreModalOpen, setIsPlayerScoreModalOpen] = useState(false);
  const [selectedScorePlayerId, setSelectedScorePlayerId] = useState<number | null>(1);
  const [selectedScoreCaddie, setSelectedScoreCaddie] = useState(() => {
    const initialCaddieCode = localStorage.getItem('caddieCode');
    if (initialCaddieCode) return initialCaddieCode;

    const savedMaster = localStorage.getItem('golf_caddies_master');
    if (savedMaster) {
      const parsed = JSON.parse(savedMaster);
      if (parsed.length > 0) return parsed[0].name;
    }
    return '305';
  });
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [activePlayerForPhone, setActivePlayerForPhone] = useState<number | null>(null);
  
  // HCP States
  const [isHCPModalOpen, setIsHCPModalOpen] = useState(false);
  const [activePlayerForHCP, setActivePlayerForHCP] = useState<number | null>(null);

  // Tee Box States
  const [isTeeBoxModalOpen, setIsTeeBoxModalOpen] = useState(false);
  const [activePlayerForTee, setActivePlayerForTee] = useState<number | null>(null);

  // Customer Selection States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [activePlayerForCustomer, setActivePlayerForCustomer] = useState<number | null>(null);

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('golf_players_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '', gender: 'M', teeBox: 'Biru' as TeeBoxColor, status: 'Red', phone: '', hcp: 0 },
      { id: 2, name: '', gender: 'M', teeBox: 'Putih' as TeeBoxColor, status: 'Red', phone: '', hcp: 0 },
      { id: 3, name: '', gender: 'M', teeBox: 'Putih' as TeeBoxColor, status: 'Red', phone: '', hcp: 0 },
      { id: 4, name: '', gender: 'M', teeBox: 'Putih' as TeeBoxColor, status: 'Red', phone: '', hcp: 0 },
      { id: 5, name: '', gender: 'M', teeBox: 'Putih' as TeeBoxColor, status: 'Red', phone: '', hcp: 0 },
    ];
  });

  // Auto-save to "Local Database" (localStorage)
  useEffect(() => {
    localStorage.setItem('golf_players_data', JSON.stringify(players));
    localStorage.setItem('golf_group_name', groupName);
    localStorage.setItem('golf_is_five_players', JSON.stringify(isFivePlayers));
    localStorage.setItem('golf_selected_caddies', JSON.stringify(selectedCaddies));
    localStorage.setItem('golf_selected_courses', JSON.stringify(selectedCourses));
    localStorage.setItem('golf_starting_hole', selectedStartingHole);
    localStorage.setItem('golf_tee_off_time', JSON.stringify(selectedTeeOffTime));
    localStorage.setItem('golf_selected_cart', selectedCart);
  }, [players, groupName, isFivePlayers, selectedCaddies, selectedCourses, selectedStartingHole, selectedTeeOffTime, selectedCart]);

  const onReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua pengaturan ronde?')) {
      localStorage.removeItem('golf_players_data');
      localStorage.removeItem('golf_group_name');
      localStorage.removeItem('golf_players_scores'); // Also clear scores
      if (onResetProp) onResetProp();
      window.location.reload(); // Refresh to reset all states
    }
  };

  const clubPhotoInputRef = React.useRef<HTMLInputElement>(null);

  const handleFotoClubClick = () => {
    if (clubPhotoInputRef.current) {
      clubPhotoInputRef.current.click();
    }
  };

  const handleCustomerSelect = (customer: any) => {
    if (activePlayerForCustomer !== null) {
      setPlayers(prev => prev.map(p => 
        p.id === activePlayerForCustomer 
          ? { ...p, name: customer.name, phone: customer.contact, gender: customer.gender } 
          : p
      ));
    }
  };

  const handleHCPSave = (newName: string, newHCP: number) => {
    if (activePlayerForHCP !== null) {
      setPlayers(prev => {
        const updatedPlayers = prev.map(p => p.id === activePlayerForHCP ? { ...p, name: newName, hcp: newHCP } : p);
        
        // Sync with scorecard data in localStorage
        const savedScores = localStorage.getItem('golf_players_scores');
        if (savedScores) {
          const scores = JSON.parse(savedScores);
          const updatedScores = scores.map((s: any) => {
            if (s.id === activePlayerForHCP) {
              return { ...s, name: newName };
            }
            return s;
          });
          localStorage.setItem('golf_players_scores', JSON.stringify(updatedScores));
        }
        
        return updatedPlayers;
      });
    }
  };

  const handleTeeBoxSave = (newTee: TeeBoxColor) => {
    if (activePlayerForTee !== null) {
      setPlayers(prev => prev.map(p => p.id === activePlayerForTee ? { ...p, teeBox: newTee } : p));
    }
  };

  const activePlayerNameHCP = players.find(p => p.id === activePlayerForHCP)?.name || '';
  const activePlayerHCP = players.find(p => p.id === activePlayerForHCP)?.hcp || 0;
  
  const activePlayerNameTee = players.find(p => p.id === activePlayerForTee)?.name || '';
  const activePlayerTee = players.find(p => p.id === activePlayerForTee)?.teeBox || 'Putih';

  const toggleGender = (id: number) => {
    setPlayers(players.map(p => p.id === id ? { ...p, gender: p.gender === 'M' ? 'F' : 'M' } : p));
  };

  const handleCourseSelect = (option: string) => {
    setSelectedCourses({
      ...selectedCourses,
      [currentCourseSlot]: option
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] text-gray-800 font-sans flex flex-col z-[100] animate-in fade-in duration-300">
      {/* Hidden input for Foto Club camera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={clubPhotoInputRef} 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            console.log("Captured Club Photo:", e.target.files[0]);
          }
        }}
      />
      {/* Background with full coverage and dark blue gradient */}
      <div className="absolute inset-0 bg-[#050b18]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#050b18] to-[#02060c]" />
      <div className="absolute inset-0 bg-black/40" />

      {/* Header */}
      <header className="relative z-10 bg-white/30 px-8 py-4 shadow-sm flex items-center justify-between border-b border-white/20 backdrop-blur-2xl">
        <h1 className="text-2xl font-bold text-white">Pengaturan Ronde</h1>
        <div className="flex items-center gap-4">
          {/* Status indicators or other header info could go here */}
        </div>
      </header>

      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Panel: Informasi Ronde */}
        <div className="w-[320px] bg-white/10 border-r border-white/10 flex flex-col backdrop-blur-3xl">
          <div className="p-6 space-y-8 overflow-y-auto flex-1">
            <section>
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Informasi Ronde</h2>
              
              <div className="space-y-4">
                {/* Course Name */}
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white leading-tight">Palm Springs K...</span>
                </div>

                {/* Pilih Caddie */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/60">Pilih caddie</label>
                    <div 
                      onClick={() => {
                        setCurrentCaddieSlot(0);
                        setIsCaddieModalOpen(true);
                      }}
                      className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <span className="font-bold text-white">{selectedCaddies[0] || 'Tidak dipilih'}</span>
                      <ChevronDown size={16} className="text-white/40" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/60">Pilih caddie</label>
                    <div 
                      onClick={() => {
                        setCurrentCaddieSlot(1);
                        setIsCaddieModalOpen(true);
                      }}
                      className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <span className={`font-bold ${!selectedCaddies[1] ? 'text-white/30 font-medium' : 'text-white'}`}>
                        {selectedCaddies[1] || 'Tidak dipilih'}
                      </span>
                      <ChevronDown size={16} className="text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Waktu Tee-off */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Waktu Tee-off</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => {
                        setTimeModalType('hour');
                        setIsTimeModalOpen(true);
                      }}
                      className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <span className="font-bold text-white">{selectedTeeOffTime.hour}</span>
                      <ChevronDown size={16} className="text-white/40" />
                    </div>
                    <div 
                      onClick={() => {
                        setTimeModalType('minute');
                        setIsTimeModalOpen(true);
                      }}
                      className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <span className="font-bold text-white">{selectedTeeOffTime.minute}</span>
                      <ChevronDown size={16} className="text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Cart */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Cart</label>
                  <div 
                    onClick={() => setIsCartModalOpen(true)}
                    className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <span className="font-bold text-white">{selectedCart}</span>
                    <ChevronDown size={16} className="text-white/40" />
                  </div>
                </div>

                {/* OUT / IN Selection */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 border-dashed">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-tighter">OUT</label>
                    <div 
                      onClick={() => {
                        setCurrentCourseSlot('OUT');
                        setIsCourseModalOpen(true);
                      }}
                      className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <span className="font-bold text-white">{selectedCourses.OUT}</span>
                      <ChevronDown size={16} className="text-white/40" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-tighter">IN</label>
                    <div 
                      onClick={() => {
                        setCurrentCourseSlot('IN');
                        setIsCourseModalOpen(true);
                      }}
                      className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <span className="font-bold text-white">{selectedCourses.IN}</span>
                      <ChevronDown size={16} className="text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Tambah 9 Hole */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Tambah 9 Hole</label>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between cursor-not-allowed opacity-40">
                    <span className="text-white/40 font-medium">Tidak dipilih</span>
                    <ChevronDown size={16} className="text-white/20" />
                  </div>
                </div>

                {/* Lubang Awal */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Lubang Awal</label>
                  <div 
                    onClick={() => setIsHoleModalOpen(true)}
                    className="bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <span className="font-bold text-white">{selectedStartingHole}</span>
                    <ChevronDown size={16} className="text-white/40" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel: Group & Players */}
        <div className="flex-1 flex flex-col">
          <div className="p-8 space-y-8 overflow-y-auto flex-1">
            {/* Group Name Section */}
            <section className="bg-white/10 rounded-2xl p-6 shadow-xl border border-white/10 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Nama Group</h2>
                <div className="flex items-center gap-4">
                  <button 
                      onClick={() => {
                        setIsPlayerScoreModalOpen(true);
                      }}
                      className="bg-white text-blue-600 font-bold text-sm px-6 py-2 rounded-lg hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/5"
                    >
                      Pilih Pelanggan
                    </button>
                  <button 
                    onClick={handleFotoClubClick}
                    className="bg-white/10 text-white font-bold text-sm border-2 border-white/20 px-6 py-1.5 rounded-lg hover:bg-white/20 transition-all active:scale-95"
                  >
                    Foto Club
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Masukan nama Group"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full text-2xl font-bold text-white placeholder:text-white/20 border-b-2 border-white/10 focus:border-white/40 outline-none pb-2 transition-colors bg-transparent"
              />
            </section>

            {/* Players Table Section */}
            <section className="bg-white/10 rounded-2xl p-6 shadow-xl border border-white/10 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="fivePlayers"
                      checked={isFivePlayers}
                      onChange={(e) => setIsFivePlayers(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/50"
                    />
                    <label htmlFor="fivePlayers" className="font-bold text-white">Pertandingan 5 Pemain</label>
                  </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded text-xs font-bold text-white/50 uppercase tracking-widest">Index</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10">
                      <th className="pb-4 pr-4">Urutan</th>
                      <th className="pb-4 pr-4">Nama</th>
                      <th className="pb-4 pr-4 text-center">Jenis Kelamin</th>
                      <th className="pb-4 pr-4 text-center">Tee Box</th>
                      <th className="pb-4 pr-4">No. Handphone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {players.slice(0, isFivePlayers ? 5 : 4).map((player, index) => (
                      <tr key={player.id} className="group">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white/40">{index + 1}</span>
                            {index < (isFivePlayers ? 4 : 3) && (
                              <button className="p-1 hover:bg-white/10 rounded text-white/20 hover:text-white transition-all">
                                <ArrowUpDown size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <input 
                            type="text"
                            placeholder="Input"
                            value={player.name}
                            readOnly
                            onClick={() => {
                              setActivePlayerForHCP(player.id);
                              setIsHCPModalOpen(true);
                            }}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all cursor-pointer ${player.name ? 'text-white' : 'text-white/30'}`}
                          />
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex justify-center">
                            <div 
                              onClick={() => toggleGender(player.id)}
                              className="bg-white/5 p-1 rounded-full flex items-center cursor-pointer select-none"
                            >
                              <div className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${player.gender === 'M' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : 'text-white/40'}`}>M</div>
                              <div className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${player.gender === 'F' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50' : 'text-white/40'}`}>F</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex justify-center gap-2">
                            {/* Tee Box Color Selector */}
                            <div 
                              onClick={() => {
                                setActivePlayerForTee(player.id);
                                setIsTeeBoxModalOpen(true);
                              }}
                              className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all min-w-[70px] justify-center"
                            >
                              <div className="relative w-5 h-6">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/40" />
                                <div className={`absolute left-0.5 top-0 w-3.5 h-2.5 ${
                                  player.teeBox === 'Hitam' ? 'bg-black' : 
                                  player.teeBox === 'Biru' ? 'bg-blue-500' : 
                                  player.teeBox === 'Putih' ? 'bg-white' : 
                                  'bg-red-500'
                                } shadow-sm`} />
                              </div>
                              <ChevronDown size={14} className="text-white/40" />
                            </div>

                            {/* Indonesian Flag / Status Selector */}
                            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all min-w-[70px] justify-center">
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 flex flex-col shadow-sm">
                                <div className="flex-1 bg-red-600" />
                                <div className="flex-1 bg-white" />
                              </div>
                              <ChevronDown size={14} className="text-white/40" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <input 
                            type="text"
                            placeholder="Input"
                            value={player.phone}
                            readOnly
                            onClick={() => {
                              setActivePlayerForPhone(player.id);
                              setIsPhoneModalOpen(true);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all text-white/30 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Bottom Actions */}
          <footer className="bg-white/10 p-6 border-t border-white/10 flex justify-end items-center gap-4 backdrop-blur-3xl">
            <button 
              onClick={onReset}
              className="bg-white/5 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 border border-white/10"
            >
              <RotateCcw size={20} /> Reset
            </button>
            <button 
              onClick={onBack}
              className="bg-blue-600 text-white px-12 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/40 hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2"
            >
              Kembali
            </button>
          </footer>
        </div>
      </div>

      <CaddieSelectionModal 
        isOpen={isCaddieModalOpen}
        onClose={() => setIsCaddieModalOpen(false)}
        selectedCaddie={selectedCaddies[currentCaddieSlot]}
        onSelect={(num) => {
          const newCaddies = [...selectedCaddies];
          newCaddies[currentCaddieSlot] = num;
          setSelectedCaddies(newCaddies);
          
          // If changing the primary caddie, also update the global caddieCode
          if (currentCaddieSlot === 0) {
            localStorage.setItem('caddieCode', num);
          }
        }}
      />

      <CourseSelectionModal 
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSelect={handleCourseSelect}
        selectedOption={selectedCourses[currentCourseSlot]}
        options={['OUT', 'IN']}
      />

      <HoleSelectionModal 
        isOpen={isHoleModalOpen}
        onClose={() => setIsHoleModalOpen(false)}
        onSelect={setSelectedStartingHole}
        selectedOption={selectedStartingHole}
      />

      <CartSelectionModal 
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onSelect={setSelectedCart}
        selectedOption={selectedCart}
      />

      <TimeSelectionModal 
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        title={timeModalType === 'hour' ? 'Pilih Jam' : 'Pilih Menit'}
        options={
          timeModalType === 'hour' 
            ? Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
            : Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
        }
        selectedOption={timeModalType === 'hour' ? selectedTeeOffTime.hour : selectedTeeOffTime.minute}
        onSelect={(val) => {
          setSelectedTeeOffTime(prev => ({
            ...prev,
            [timeModalType]: val
          }));
        }}
      />

      <PlayerScoreInputModal 
        isOpen={isPlayerScoreModalOpen}
        onClose={() => setIsPlayerScoreModalOpen(false)}
        players={players}
        selectedPlayerId={selectedScorePlayerId}
        onSelectPlayer={setSelectedScorePlayerId}
        availableCaddies={selectedCaddies}
        selectedCaddie={selectedScoreCaddie}
        onSelectCaddie={setSelectedScoreCaddie}
      />

      <PhoneInputModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        playerName={players.find(p => p.id === activePlayerForPhone)?.name || '-'}
        initialValue={players.find(p => p.id === activePlayerForPhone)?.phone || ''}
        onSave={(phoneValue) => {
          setPlayers(prev => prev.map(p => p.id === activePlayerForPhone ? { ...p, phone: phoneValue } : p));
        }}
      />

      <HCPSettingsModal 
        isOpen={isHCPModalOpen}
        onClose={() => setIsHCPModalOpen(false)}
        playerName={activePlayerNameHCP}
        currentHCP={activePlayerHCP}
        onSave={handleHCPSave}
      />

      <TeeBoxSelectionModal
        isOpen={isTeeBoxModalOpen}
        onClose={() => setIsTeeBoxModalOpen(false)}
        playerName={activePlayerNameTee}
        selectedTee={activePlayerTee}
        onSelect={handleTeeBoxSave}
      />

      <CustomerSelectionModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={handleCustomerSelect}
      />
    </div>
  );
};

export default RoundSettings;
