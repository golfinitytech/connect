import React, { useState, useEffect } from 'react';

interface HCPSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  currentHCP: number;
  onSave: (newName: string, newHCP: number) => void;
}

const HCPSettingsModal = ({ isOpen, onClose, playerName: initialPlayerName, currentHCP, onSave }: HCPSettingsModalProps) => {
  const [hcp, setHcp] = useState(currentHCP);
  const [playerName, setPlayerName] = useState(initialPlayerName);

  useEffect(() => {
    setHcp(currentHCP);
    setPlayerName(initialPlayerName);
  }, [currentHCP, initialPlayerName, isOpen]);

  if (!isOpen) return null;

  const handleIncrement = () => setHcp(prev => Math.min(prev + 1, 36));
  const handleDecrement = () => setHcp(prev => Math.max(prev - 1, 0));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#f1f5f9] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-10">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Pengaturan HCP</h2>
          <p className="text-lg text-slate-500 font-medium">Ubah HCP masing masing pemain</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-white">
            <button 
              onClick={handleDecrement}
              className="w-14 h-14 flex items-center justify-center text-2xl font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors border-r border-slate-300"
            >
              —
            </button>
            <button 
              onClick={handleIncrement}
              className="w-14 h-14 flex items-center justify-center text-2xl font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              +
            </button>
          </div>

          <div className="w-24 h-14 border border-slate-300 rounded-lg bg-white flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-700">{hcp}</span>
          </div>

          <div className="flex-1 h-14 border border-slate-300 rounded-lg bg-white flex items-center px-4">
            <input 
              type="text"
              value={playerName === '-' ? '' : playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Input"
              className="w-full bg-transparent border-none outline-none text-xl font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border-2 border-blue-500 text-blue-500 font-bold rounded-xl text-xl hover:bg-blue-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              onSave(playerName || '', hcp);
              onClose();
            }}
            className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-xl text-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default HCPSettingsModal;
