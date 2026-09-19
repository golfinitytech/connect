import React, { useState } from 'react';
import { X } from 'lucide-react';

interface MiniScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
}

const MiniScorecardModal = ({ isOpen, onClose, activity }: MiniScorecardModalProps) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen || !activity) return null;

  const players = activity.rawPlayersData || [];
  const currentPlayerName = players[activeTab]?.name || 'Player';
  const currentScores = players[activeTab]?.scores || { IN: [], OUT: [] };

  const pars = [4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 4, 5, 4, 3, 5, 4];
  
  // Format scores array
  const scores = Array(18).fill('-');
  let inScore = 0;
  let outScore = 0;

  // Process IN scores (Holes 1-9)
  if (Array.isArray(currentScores.IN)) {
    currentScores.IN.forEach((s: number, i: number) => {
      if (i < 9 && s > 0) {
        scores[i] = s.toString();
        inScore += s;
      }
    });
  }

  // Process OUT scores (Holes 10-18)
  if (Array.isArray(currentScores.OUT)) {
    currentScores.OUT.forEach((s: number, i: number) => {
      if (i < 9 && s > 0) {
        scores[i + 9] = s.toString();
        outScore += s;
      }
    });
  }
  
  const totalScore = inScore + outScore;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1A17] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-white relative">
        <button onClick={onClose} className="absolute top-6 right-6 bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl transition-colors z-10">
          <X size={20} className="text-white/70" />
        </button>

        <div className="p-8">
          {/* Tabs for multiple players */}
          {players.length > 1 && (
            <div className="flex gap-2 mb-6">
              {players.map((p: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${activeTab === idx ? 'bg-[#F3734F] text-white shadow-lg shadow-[#F3734F]/30' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  {p.name || `Player ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="flex items-end gap-5 mb-8 justify-between w-full">
            <div className="flex items-end gap-5">
              <div className="flex flex-col items-center">
                <span className="text-[#F3734F] text-[11px] font-black tracking-widest mb-1.5">RANK</span>
                <div className="w-16 h-16 rounded-2xl border-2 border-[#F3734F] flex items-center justify-center bg-[#F3734F]/10 shadow-[0_0_15px_rgba(243,115,79,0.2)]">
                  <span className="text-4xl font-black italic">{activeTab + 1}</span>
                </div>
              </div>
              <h2 className="text-6xl font-black italic tracking-tight pb-1">{currentPlayerName}</h2>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-xl border-2 font-bold text-sm tracking-wider uppercase flex items-center gap-2 ${
              activity.status === 'Completed' 
                ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                : 'border-amber-500/50 bg-amber-500/10 text-amber-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'Completed' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
              }`} />
              {activity.status === 'Completed' ? 'COMPLETED' : 'IN PROGRESS'}
            </div>
          </div>

          <div className="w-full h-px bg-white/10 mb-8"></div>

          {/* Score Detail Title */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F3734F]"></div>
            <span className="text-[#F3734F] text-sm font-black tracking-widest uppercase">Score Detail (Hole 1-18)</span>
          </div>

          {/* Grid 1-9 */}
          <div className="grid grid-cols-9 gap-3 mb-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-[#11231E] rounded-2xl flex flex-col items-center py-3.5 border border-white/5">
                <span className="text-[#6A8680] text-xs font-bold mb-2">H{i + 1}</span>
                <span className="text-2xl font-black italic mb-2">{scores[i]}</span>
                <span className="text-[#F3734F] text-[10px] font-bold bg-[#F3734F]/10 px-2 py-0.5 rounded">P{pars[i]}</span>
              </div>
            ))}
          </div>

          {/* Grid 10-18 */}
          <div className="grid grid-cols-9 gap-3 mb-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i + 9} className="bg-[#11231E] rounded-2xl flex flex-col items-center py-3.5 border border-white/5">
                <span className="text-[#6A8680] text-xs font-bold mb-2">H{i + 10}</span>
                <span className="text-2xl font-black italic mb-2">{scores[i + 9]}</span>
                <span className="text-[#F3734F] text-[10px] font-bold bg-[#F3734F]/10 px-2 py-0.5 rounded">P{pars[i + 9]}</span>
              </div>
            ))}
          </div>

          {/* Summary Boxes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#11231E] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[#F3734F] text-xs font-black tracking-widest mb-1">IN (1-9)</span>
              <span className="text-4xl font-black italic">{inScore}</span>
            </div>
            <div className="bg-[#11231E] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[#F3734F] text-xs font-black tracking-widest mb-1">OUT (10-18)</span>
              <span className="text-4xl font-black italic">{outScore}</span>
            </div>
            <div className="bg-[#11231E] border border-[#F3734F]/40 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(243,115,79,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#F3734F]/10 to-transparent"></div>
              <span className="text-white text-sm font-black tracking-widest mb-1 relative z-10">TOTAL</span>
              <span className="text-[#F3734F] text-5xl font-black italic relative z-10">{totalScore}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MiniScorecardModal;