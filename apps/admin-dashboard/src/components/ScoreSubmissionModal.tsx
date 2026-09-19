import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface PlayerScore {
  id: number;
  name: string;
  scores: {
    IN: (number | null)[];
    OUT: (number | null)[];
  };
  manualTotal: number | null;
}

interface ScoreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerScore[];
}

const ScoreSubmissionModal = ({ isOpen, onClose, players: initialPlayers }: ScoreSubmissionModalProps) => {
  const [currentHoleIdx, setCurrentHoleIdx] = useState(0); // 0-17
  const [players, setPlayers] = useState<PlayerScore[]>(initialPlayers);
  const [playerDetails, setPlayerDetails] = useState<Record<number, Record<number, { putts: number | null, teeShot: string | null }>>>(() => {
    const saved = localStorage.getItem('golf_players_details');
    return saved ? JSON.parse(saved) : {};
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showExitConfirmPopup, setShowExitConfirmPopup] = useState(false);

  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  if (!isOpen) return null;

  const isIN = currentHoleIdx < 9;
  const displayHoleNum = currentHoleIdx + 1;
  const holeType = isIN ? 'IN' : 'OUT';
  const scoreIdx = isIN ? currentHoleIdx : currentHoleIdx - 9;

  const scoreOptions = [-2, -1, 0, 1, 2, 3, 4, 5];
  const puttOptions = [0, 1, 2, 3, 4, 5];

  const handleScoreChange = (playerId: number, score: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const newScores = { ...p.scores };
        newScores[holeType][scoreIdx] = score;
        return { ...p, scores: newScores };
      }
      return p;
    }));
  };

  const handlePuttChange = (playerId: number, putts: number) => {
    setPlayerDetails(prev => {
      const updated = {
        ...prev,
        [playerId]: {
          ...(prev[playerId] || {}),
          [currentHoleIdx]: {
            ...(prev[playerId]?.[currentHoleIdx] || { teeShot: null }),
            putts
          }
        }
      };
      localStorage.setItem('golf_players_details', JSON.stringify(updated));
      return updated;
    });
  };

  const handleTeeShotChange = (playerId: number, teeShot: string) => {
    setPlayerDetails(prev => {
      const updated = {
        ...prev,
        [playerId]: {
          ...(prev[playerId] || {}),
          [currentHoleIdx]: {
            ...(prev[playerId]?.[currentHoleIdx] || { putts: null }),
            teeShot
          }
        }
      };
      localStorage.setItem('golf_players_details', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSave = () => {
    localStorage.setItem('golf_players_scores', JSON.stringify(players));
    localStorage.setItem('golf_players_details', JSON.stringify(playerDetails));
    
    // Ambil kode tablet
    const tabletCode = localStorage.getItem('golf_tablet_code') || Math.floor(1000 + Math.random() * 9000).toString();
    if (!localStorage.getItem('golf_tablet_code')) {
      localStorage.setItem('golf_tablet_code', tabletCode);
    }

    setShowSuccessPopup(true);
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-white animate-in fade-in slide-in-from-bottom duration-300">
      {/* Top Banner */}
      <div className="bg-[#1e40af] px-10 py-6 flex items-center justify-between relative overflow-hidden h-32 shrink-0">
        <div className="relative z-10 text-white">
          <span className="text-white/60 font-bold text-xs uppercase tracking-widest">GOLFINITYSCORE</span>
          <h1 className="text-3xl font-black leading-tight">
            Where Every Stroke Counts!
          </h1>
          <p className="text-white/70 font-bold text-sm">
            Manage your scores and memories with GOLFINITYSCORE.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-40">
            <img 
                src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop" 
                alt="Golf" 
                className="w-full h-full object-cover"
            />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-white" />
        </button>
      </div>

      {/* Control Header */}
      <div className="bg-[#1e293b] text-white px-10 py-4 flex items-center shrink-0">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-xs uppercase">Course</span>
            <span className="text-2xl font-black italic">{holeType}</span>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-800/50 px-4 py-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setCurrentHoleIdx(prev => Math.max(0, prev - 1))}
              disabled={currentHoleIdx === 0}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold text-xs uppercase">Hole</span>
              <span className="text-4xl font-black italic w-12 text-center">{displayHoleNum}</span>
            </div>
            <button 
              onClick={() => setCurrentHoleIdx(prev => Math.min(17, prev + 1))}
              disabled={currentHoleIdx === 17}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-xs uppercase">Par</span>
            <span className="text-4xl font-black italic">4</span>
          </div>
          
          <div className="flex gap-2 ml-4">
            <button className="px-4 py-1.5 border border-slate-600 rounded text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors">Longest</button>
            <button className="px-4 py-1.5 border border-slate-600 rounded text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors">Nearest</button>
          </div>
        </div>

        <div className="flex gap-4 ml-auto">
            <button 
                onClick={onClose}
                className="px-10 py-2.5 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 font-bold rounded-xl text-xl transition-all active:scale-95"
            >
                Batal
            </button>
            <button 
                onClick={handleSave}
                className="px-10 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
                Simpan
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
              <th className="py-4 px-10 text-left w-48">Player</th>
              <th className="py-4 text-center">Score</th>
              <th className="py-4 text-center">Putts</th>
              <th className="py-4 text-center w-64">Tee shot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {players.filter(p => p.name && p.name !== '-').map((player) => {
              const currentScore = player.scores[holeType][scoreIdx];
              const details = playerDetails[player.id]?.[currentHoleIdx] || { putts: null, teeShot: null };

              return (
                <tr key={player.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-8 px-10">
                    <h3 className="text-2xl font-black text-slate-800">{player.name}</h3>
                  </td>
                  
                  <td className="py-8 px-4">
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden h-16 max-w-2xl mx-auto">
                      {scoreOptions.map((num) => (
                        <button
                          key={num}
                          onClick={() => handleScoreChange(player.id, num)}
                          className={`flex-1 flex flex-col items-center justify-center border-r border-slate-100 last:border-0 transition-all ${
                            currentScore === num ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xl font-black">{num > 0 ? `+${num}` : num}</span>
                          {(num === 5 || num === -2) && <span className="text-[8px] font-bold mt-[-4px]">...</span>}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td className="py-8 px-4">
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden h-16 max-w-sm mx-auto">
                      {puttOptions.map((num) => (
                        <button
                          key={num}
                          onClick={() => handlePuttChange(player.id, num)}
                          className={`flex-1 flex flex-col items-center justify-center border-r border-slate-100 last:border-0 transition-all ${
                            details.putts === num ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xl font-black">{num}</span>
                          {num === 5 && <span className="text-[8px] font-bold mt-[-4px]">...</span>}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td className="py-8 px-10">
                    <div className="grid grid-cols-2 grid-rows-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden h-16">
                        <button 
                            onClick={() => handleTeeShotChange(player.id, 'Fairway')}
                            className={`col-span-2 flex items-center justify-center font-bold text-xs transition-all ${details.teeShot === 'Fairway' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-500'}`}
                        >
                            Fairway
                        </button>
                        <button 
                            onClick={() => handleTeeShotChange(player.id, 'Bunker Rough')}
                            className={`flex flex-col items-center justify-center font-bold text-[9px] leading-tight transition-all ${details.teeShot === 'Bunker Rough' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-500'}`}
                        >
                            <span>Bunker</span>
                            <span>Rough</span>
                        </button>
                        <button 
                            onClick={() => handleTeeShotChange(player.id, 'OB PA')}
                            className={`flex flex-col items-center justify-center font-bold text-[9px] leading-tight transition-all ${details.teeShot === 'OB PA' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-500'}`}
                        >
                            <span>OB</span>
                            <span>PA</span>
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          <div className="relative bg-[#f1f5f9] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-10 text-center space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">Terkirim</h2>
              
              <div className="space-y-2 py-4">
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  Skor berhasil disimpan dan dikirim!
                </p>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  Silakan gunakan Kode Tablet:
                </p>
                <div className="bg-emerald-100 text-emerald-700 py-3 px-6 rounded-xl inline-block mt-2">
                  <span className="text-4xl font-black tracking-widest">{localStorage.getItem('golf_tablet_code')}</span>
                </div>
                <p className="text-lg text-slate-500 font-medium leading-relaxed mt-2">
                  untuk melakukan print Scorecard di layar Kiosk.
                </p>
              </div>

              <div className="flex pt-4">
                <button 
                  onClick={() => {
                    setShowSuccessPopup(false);
                    setShowExitConfirmPopup(true);
                  }}
                  className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-xl text-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Popup */}
      {showExitConfirmPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          <div className="relative bg-[#f1f5f9] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-10 text-center space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">Keluar</h2>
              
              <div className="space-y-2 py-4">
                <p className="text-xl text-slate-600 font-medium">Apakah Anda akan keluar dari permainan?</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setShowExitConfirmPopup(false);
                    onClose();
                  }}
                  className="flex-1 py-4 border-2 border-blue-500 text-blue-500 font-bold rounded-xl text-xl hover:bg-blue-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={async () => {
                    setShowExitConfirmPopup(false);

                    try {
                      // Send completed status to backend
                      const locationId = localStorage.getItem('adminLocationId') || 'karawang';
                      const caddieCode = localStorage.getItem('caddieCode') || '001';
                      
                      // @ts-ignore
                      const { default: api } = await import('../services/api');
                      await api.post('/tournaments/rounds', {
                        locationId,
                        caddieCode,
                        players: players.map(p => ({ 
                          name: p.name || 'Unknown',
                          scores: p.scores
                        })),
                        isCompleted: true
                      });
                    } catch (e) {
                      console.error('Failed to complete round activity', e);
                    }

                    // Clear the scores to make scorecard empty
                    localStorage.removeItem('golf_players_scores');
                    localStorage.removeItem('golf_players_details');
                    localStorage.removeItem('golf_players_data'); // Clear player data too so it resets completely
                    onClose();
                    // Reload to reflect empty state and return to dashboard
                    window.location.reload();
                  }}
                  className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-xl text-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreSubmissionModal;
