import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import api from '../services/api';
import { Spinner, useAsyncAction } from './ui/Loading';

interface Player {
  id: number;
  name: string;
}

interface PlayerScoreInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  selectedPlayerId: number | null;
  onSelectPlayer: (playerId: number) => void;
  availableCaddies: string[];
  selectedCaddie: string;
  onSelectCaddie: (caddie: string) => void;
}

const PlayerScoreInputModal = ({ 
  isOpen, 
  onClose, 
  players,
  selectedPlayerId,
  onSelectPlayer,
  availableCaddies,
  selectedCaddie,
  onSelectCaddie
}: PlayerScoreInputModalProps) => {
  const { run: handleSave, pending: saving } = useAsyncAction(async () => {
    try {
      const selectedPlayer = players.find(p => p.id === selectedPlayerId);
      if (selectedPlayer && selectedPlayer.name && selectedPlayer.name !== '-' && selectedPlayer.name !== '') {
        const locationId = localStorage.getItem('adminLocationId') || 'karawang';
        
        // Log this pairing to our backend
        await api.post('/caddie-performance', {
          locationId,
          caddieCode: selectedCaddie,
          playerName: selectedPlayer.name,
          date: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to log caddie performance', error);
    }
    
    onClose();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      
      <div className="relative bg-[#f1f5f9] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 leading-tight">
              Pilih pelanggan yang akan menginput skor
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Pilih pemain untuk memasukan skor dan pilih caddy yang bertugas.<br />
              informasi yang dipilih akan muncul di statistik performa caddy
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {players.filter(p => p.name).map((player) => {
              const isSelected = selectedPlayerId === player.id;
              
              return (
                <div 
                  key={player.id}
                  className="bg-white border border-slate-300 rounded-lg p-3 flex items-center gap-4 shadow-sm"
                >
                  <div 
                    onClick={() => onSelectPlayer(player.id)}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}
                  >
                    {isSelected && <Check size={18} className="text-white" strokeWidth={4} />}
                  </div>
                  
                  <span className="flex-1 font-bold text-slate-700 text-xl">
                    {player.name}
                  </span>

                  <div className="relative min-w-[140px]">
                    <select 
                      value={selectedCaddie}
                      onChange={(e) => onSelectCaddie(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer pr-10 text-lg"
                    >
                      {availableCaddies.filter(c => c).map((caddie) => (
                        <option key={caddie} value={caddie}>{caddie}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={20} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-4 border-2 border-slate-300 text-slate-800 font-bold rounded-xl text-xl hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              Batal
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-xl text-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {saving && <Spinner size={20} />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerScoreInputModal;
