import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface ScoreInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  holeNumber: number;
  currentScore: number | string | null;
  parValue?: number;
  onSave: (score: number | string | null) => void;
}

const ScoreInputModal = ({ 
  isOpen, 
  onClose, 
  playerName, 
  holeNumber, 
  currentScore, 
  parValue,
  onSave 
}: ScoreInputModalProps) => {
  // Empty = nothing typed yet; the par is shown only as a placeholder.
  const [value, setValue] = useState<string>('');
  // The first key press replaces whatever is shown (placeholder or previous score)
  // instead of appending to it ("4" then "5" -> "5", not "45").
  const [fresh, setFresh] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setValue(currentScore && currentScore !== 0 ? currentScore.toString() : '');
      setFresh(true);
    }
  }, [isOpen, currentScore]);

  if (!isOpen) return null;

  const MAX_STROKES = 15;
  const numeric = value === '' || value === 'OUT' ? null : parseInt(value, 10);
  const isValid = value === 'OUT' || (numeric !== null && numeric >= 1 && numeric <= MAX_STROKES);

  const handleNumberClick = (num: string) => {
    setValue(prev => {
      if (fresh || prev === 'OUT' || prev === '' || prev === '0') return num === '0' ? '' : num;
      if (prev.length < 2) return prev + num;
      return prev;
    });
    setFresh(false);
  };

  const handleDelete = () => {
    setValue(prev => (prev === 'OUT' ? '' : prev.slice(0, -1)));
    setFresh(false);
  };

  const handleClear = () => {
    setValue('');
    setFresh(false);
  };

  // +/- start from the par when nothing has been entered yet.
  const base = () => (numeric ?? parValue ?? 0);
  const handleDecrement = () => {
    if (value === 'OUT') return;
    setValue(String(Math.max(1, numeric === null ? base() - 1 : numeric - 1)));
    setFresh(false);
  };

  const handleIncrement = () => {
    if (value === 'OUT') return;
    setValue(String(Math.min(MAX_STROKES, numeric === null ? base() + 1 : numeric + 1)));
    setFresh(false);
  };

  const handleSave = () => {
    if (!isValid) return;
    onSave(value === 'OUT' ? 'OUT' : numeric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10 flex items-center gap-3">
            <img src="/logo1.png" alt="Logo" className="h-6 w-auto object-contain brightness-0 invert" />
            <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400">GolfinityConnect</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-xl transition-all group active:scale-90 relative z-10"
          >
            <X size={20} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Display */}
        <div className="p-8 flex justify-center items-center gap-6">
          <button 
            onClick={handleDecrement}
            className="w-16 h-16 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all rounded-2xl flex items-center justify-center text-4xl font-black text-slate-600 shadow-sm"
          >
            -
          </button>

          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200">
            {value ? (
              <span className={`font-black text-slate-800 ${value === 'OUT' ? 'text-3xl' : 'text-5xl'}`}>{value}</span>
            ) : (
              <span className="text-5xl font-black text-slate-300" title="Par (placeholder)">{parValue ?? '-'}</span>
            )}
          </div>

          <button 
            onClick={handleIncrement}
            className="w-16 h-16 bg-blue-100 hover:bg-blue-200 active:scale-95 transition-all rounded-2xl flex items-center justify-center text-4xl font-black text-blue-600 shadow-sm"
          >
            +
          </button>
        </div>

        {/* Keypad */}
        <div className="px-6 pb-8 grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-16 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl text-2xl font-black text-slate-700 border border-slate-200/50 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-16 bg-red-50 hover:bg-red-100 active:scale-95 transition-all rounded-xl text-lg font-black text-red-600 border border-red-200/50 shadow-sm"
          >
            C
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl text-2xl font-black text-slate-700 border border-slate-200/50 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl flex items-center justify-center text-slate-700 border border-slate-200/50 shadow-sm"
          >
            <Delete size={24} />
          </button>
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={() => setValue('OUT')}
            className="w-full py-4 bg-orange-50 hover:bg-orange-100 active:scale-[0.98] transition-all rounded-xl text-lg font-black text-orange-600 border border-orange-200/50 shadow-sm uppercase tracking-widest"
          >
            Pemain Keluar (NR)
          </button>
        </div>

        {/* Save Button */}
        <div className="px-6 pb-6">
          {numeric !== null && numeric > MAX_STROKES && (
            <p className="mb-2 text-center text-xs font-bold text-red-600">Skor maksimal {MAX_STROKES}.</p>
          )}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-2xl text-xl font-black text-white shadow-xl shadow-blue-600/30"
          >
            {value === '' ? 'KETUK ANGKA SKOR' : 'SIMPAN SKOR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreInputModal;
