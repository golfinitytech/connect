import React from 'react';

interface TopDressingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TopDressingConfirmModal = ({ isOpen, onClose, onConfirm }: TopDressingConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Mode Top Dressing</h2>
          <p className="text-xl text-gray-600 mb-10">Ingin memulai Mode Top Dressing?</p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-blue-500 text-blue-500 font-bold text-lg hover:bg-blue-50 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 px-6 rounded-lg bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDressingConfirmModal;
