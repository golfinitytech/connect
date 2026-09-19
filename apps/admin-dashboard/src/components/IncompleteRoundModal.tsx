import React from 'react';

interface IncompleteRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const IncompleteRoundModal = ({ isOpen, onClose, onConfirm }: IncompleteRoundModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#f1f5f9] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-10 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-800">Kirim</h2>
          
          <div className="space-y-2 py-4">
            <p className="text-xl text-slate-600 font-medium">Ronde belum selesai.</p>
            <p className="text-xl text-slate-600 font-medium leading-relaxed">
              Apakah Anda ingin mengirim ronde yang belum selesai?
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 border-2 border-blue-500 text-blue-500 font-bold rounded-xl text-xl hover:bg-blue-50 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-xl text-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncompleteRoundModal;
