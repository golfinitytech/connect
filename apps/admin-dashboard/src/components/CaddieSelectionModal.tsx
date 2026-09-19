import React, { useState, useEffect } from 'react';

interface CaddieSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (caddieNumber: string) => void;
  selectedCaddie: string;
}

const CaddieSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedCaddie 
}: CaddieSelectionModalProps) => {
  const [localSelected, setLocalSelected] = useState(selectedCaddie);
  const [caddieOptions, setCaddieOptions] = useState<string[]>([]);

  useEffect(() => {
    const savedCaddies = localStorage.getItem('golf_caddies_master');
    if (savedCaddies) {
      const parsed = JSON.parse(savedCaddies);
      // Map names to strings for the selection list
      const names = parsed.map((c: any) => c.name);
      setCaddieOptions(names);
    } else {
      // Fallback options
      setCaddieOptions(["305", "306", "307", "308", "309", "310", "311"]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b text-center relative">
          <h2 className="text-2xl font-bold text-gray-800">Pilih ({caddieOptions.length})</h2>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {caddieOptions.map((option, index) => {
            const isSelected = localSelected === option;
            
            return (
              <div 
                key={index}
                onClick={() => setLocalSelected(option)}
                className={`flex items-center gap-4 p-5 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                <span className={`text-xl font-medium ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                  {option}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gray-50 flex justify-center border-t">
          <button 
            onClick={() => {
              onSelect(localSelected);
              onClose();
            }}
            className="w-full py-4 bg-blue-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
          >
            PILIH
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaddieSelectionModal;
