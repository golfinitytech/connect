import React from 'react';
import { Settings, Info, CheckCircle2, X } from 'lucide-react';

interface GPSInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const GPSInstructionModal = ({ isOpen, onClose, onRetry }: GPSInstructionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-red-500 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings size={32} className="animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">AKTIFKAN GPS</h2>
          <p className="text-red-100 text-sm mt-1">Izin lokasi diperlukan untuk monitoring dashboard</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              Cara Mengaktifkan di Chrome:
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Klik ikon <span className="font-bold text-gray-800">Gembok (🔒)</span> atau <span className="font-bold text-gray-800">Settings</span> di baris alamat browser (paling atas).
                </p>
              </div>

              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cari menu <span className="font-bold text-gray-800">Permissions</span> atau <span className="font-bold text-gray-800">Location</span>.
                </p>
              </div>

              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ubah menjadi <span className="font-bold text-green-600 italic uppercase">Allow</span> atau <span className="font-bold text-green-600 italic uppercase">Izinkan</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-blue-700 text-xs font-medium leading-relaxed">
              *Jika tidak ada pilihan di atas, klik "Site Settings" lalu klik "Clear & Reset" untuk meminta ulang izin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex flex-col gap-3">
          <button 
            onClick={() => {
              onRetry();
              onClose();
            }}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <CheckCircle2 size={24} />
            SAYA SUDAH MENGIZINKAN
          </button>
          <p className="text-center text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            Golfinity Score Tracking System
          </p>
        </div>
      </div>
    </div>
  );
};

export default GPSInstructionModal;
