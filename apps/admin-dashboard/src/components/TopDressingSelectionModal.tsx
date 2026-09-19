import React, { useState } from 'react';

interface TopDressingSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

const options = [
  "08:41 - OUT, IN, [Yoshida]",
  "08:59 - OUT, IN, [leeyt]",
  "09:04 - OUT, IN, [jang, kimbs]",
  "10:17 - OUT, IN, [Yulia, Irena]",
  "10:38 - OUT, IN, [anang]",
  "Ronde Tes [Adam, Bram, Fajar, Faisal]",
  "Buat Baru"
];

const TopDressingSelectionModal = ({ isOpen, onClose, onSelect }: TopDressingSelectionModalProps) => {
  const [selected, setSelected] = useState<string>("Buat Baru");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/95 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b text-center relative">
          <h2 className="text-2xl font-bold text-gray-800">Pilih</h2>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {options.map((option, index) => {
            const isSpecial = option === "Ronde Tes [Adam, Bram, Fajar, Faisal]";
            const isNew = option === "Buat Baru";
            
            return (
              <div 
                key={index}
                onClick={() => setSelected(option)}
                className={`flex items-center justify-between p-5 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${selected === option ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}>
                    {selected === option && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-xl font-medium ${isSpecial ? 'text-red-500' : isNew ? 'text-gray-800 font-bold' : 'text-gray-600'}`}>
                    {option}
                  </span>
                </div>
                {!isNew && (
                  <div className="w-6 h-6 rounded-full border border-blue-400 text-blue-400 flex items-center justify-center text-xs font-bold">
                    m
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gray-50 flex justify-center border-t">
          <button 
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
            className="w-full max-w-sm py-4 bg-blue-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
          >
            PILIH
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopDressingSelectionModal;
