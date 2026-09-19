import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import CountryCodeSelectionModal from './CountryCodeSelectionModal';

interface PhoneInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  initialValue: string;
  onSave: (phone: string) => void;
}

const PhoneInputModal = ({ 
  isOpen, 
  onClose, 
  playerName, 
  initialValue, 
  onSave 
}: PhoneInputModalProps) => {
  const [phone, setPhone] = useState(initialValue);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('62');

  useEffect(() => {
    setPhone(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const renderFlag = (code: string) => {
    switch (code) {
      case '62':
        return (
          <div className="w-8 h-6 flex flex-col border border-white/20">
            <div className="bg-red-600 h-1/2 w-full" />
            <div className="bg-white h-1/2 w-full" />
          </div>
        );
      case '886':
        return <div className="w-8 h-6 bg-red-600 border border-white/20" />;
      case '63':
        return <div className="w-8 h-6 bg-blue-800 border border-white/20" />;
      case '81':
        return <div className="w-8 h-6 bg-white border border-white/20" />;
      case '86':
        return <div className="w-8 h-6 bg-red-600 border border-white/20" />;
      case '65':
        return <div className="w-8 h-6 bg-red-600 border border-white/20" />;
      case '1':
        return <div className="w-8 h-6 bg-blue-900 border border-white/20" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      {/* Dark semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in duration-300">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white tracking-tight">Input no. handphone</h2>
          <p className="text-xl font-medium text-white/70">Silakan masukkan nomor handphone dengan benar.</p>
        </div>

        {/* Input Controls */}
        <div className="flex items-center gap-4 w-full justify-center">
          {/* Player Name Display */}
          <div className="bg-white/10 border border-white/20 rounded-xl px-10 py-5 min-w-[200px]">
            <span className="text-2xl font-bold text-white">{playerName || '-'}</span>
          </div>

          {/* Flag / Country Selector */}
          <div 
            onClick={() => setIsCountryModalOpen(true)}
            className="bg-white/10 border border-white/20 rounded-xl px-6 py-5 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors"
          >
            {renderFlag(selectedCountryCode)}
            <span className="text-white font-bold text-lg ml-1">{selectedCountryCode}</span>
            <ChevronDown size={20} className="text-white/60" />
          </div>

          {/* Phone Number Input */}
          <div className="bg-white/10 border border-white/20 rounded-xl px-8 py-5 min-w-[240px] flex-1 max-w-[300px]">
            <input 
              type="tel" 
              placeholder="Input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent border-none outline-none text-2xl font-bold text-white placeholder:text-white/30 w-full text-center"
              autoFocus
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 pt-8 w-full justify-center">
          <button 
            onClick={onClose}
            className="px-16 py-4 border-2 border-blue-500 text-blue-500 font-bold text-xl rounded-xl hover:bg-blue-500/10 transition-all active:scale-95"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              onSave(`+${selectedCountryCode}${phone}`);
              onClose();
            }}
            className="px-16 py-4 bg-blue-500 text-white font-bold text-xl rounded-xl hover:bg-blue-400 transition-all shadow-xl shadow-blue-500/40 active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>

      <CountryCodeSelectionModal 
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={setSelectedCountryCode}
        selectedCode={selectedCountryCode}
      />
    </div>
  );
};

export default PhoneInputModal;
