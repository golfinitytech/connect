import React from 'react';
import { X, Check } from 'lucide-react';

export type TeeBoxColor = 'Hitam' | 'Biru' | 'Putih' | 'Merah';

interface TeeBoxOption {
  label: TeeBoxColor;
  color: string;
  bg: string;
}

const teeOptions: TeeBoxOption[] = [
  { label: 'Hitam', color: '#000000', bg: 'bg-black' },
  { label: 'Biru', color: '#3b82f6', bg: 'bg-blue-500' },
  { label: 'Putih', color: '#ffffff', bg: 'bg-white' },
  { label: 'Merah', color: '#ef4444', bg: 'bg-red-500' },
];

interface TeeBoxSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTee: TeeBoxColor;
  onSelect: (tee: TeeBoxColor) => void;
  playerName: string;
}

const TeeBoxSelectionModal = ({ isOpen, onClose, selectedTee, onSelect, playerName }: TeeBoxSelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#f8fafc] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight">Pilih Tee Box</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{playerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {teeOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                onSelect(option.label);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                selectedTee === option.label 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg shadow-sm border border-slate-200 ${option.bg}`} />
                <span className="text-lg font-bold text-slate-700">{option.label}</span>
              </div>
              {selectedTee === option.label && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-2xl transition-all"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeeBoxSelectionModal;
