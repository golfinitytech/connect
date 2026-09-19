import React from 'react';

interface CountryCode {
  code: string;
  flag: React.ReactNode;
}

interface CountryCodeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  selectedCode: string;
}

const CountryCodeSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedCode
}: CountryCodeSelectionModalProps) => {
  if (!isOpen) return null;

  const countryCodes: CountryCode[] = [
    { 
      code: '62', 
      flag: (
        <div className="w-8 h-6 flex flex-col border border-gray-100 shadow-sm">
          <div className="bg-red-600 h-1/2 w-full" />
          <div className="bg-white h-1/2 w-full" />
        </div>
      ) 
    },
    { 
      code: '886', 
      flag: (
        <div className="w-8 h-6 bg-red-600 relative overflow-hidden border border-gray-100 shadow-sm">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-800 flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      ) 
    },
    { 
      code: '63', 
      flag: (
        <div className="w-8 h-6 relative overflow-hidden border border-gray-100 shadow-sm">
          <div className="bg-blue-800 h-1/2 w-full" />
          <div className="bg-red-600 h-1/2 w-full" />
          <div className="absolute top-0 left-0 h-full w-1/3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        </div>
      ) 
    },
    { 
      code: '81', 
      flag: (
        <div className="w-8 h-6 bg-white flex items-center justify-center border border-gray-100 shadow-sm">
          <div className="w-3 h-3 bg-red-600 rounded-full" />
        </div>
      ) 
    },
    { 
      code: '86', 
      flag: (
        <div className="w-8 h-6 bg-red-600 relative border border-gray-100 shadow-sm">
          <div className="absolute top-1 left-1 text-[4px] text-yellow-400">★</div>
        </div>
      ) 
    },
    { 
      code: '65', 
      flag: (
        <div className="w-8 h-6 flex flex-col relative border border-gray-100 shadow-sm">
          <div className="bg-red-600 h-1/2 w-full flex items-center pl-1">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
          <div className="bg-white h-1/2 w-full" />
        </div>
      ) 
    },
    { 
      code: '1', 
      flag: (
        <div className="w-8 h-6 bg-white relative border border-gray-100 shadow-sm">
          <div className="bg-blue-900 w-1/2 h-1/2 absolute top-0 left-0" />
          <div className="flex flex-col w-full h-full">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`h-[14%] w-full ${i % 2 === 0 ? 'bg-red-600' : 'bg-white'}`} />
            ))}
          </div>
        </div>
      ) 
    },
  ];

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[320px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div className="p-4 border-b text-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Pilih</h2>
        </div>
        
        <div className="py-2 overflow-y-auto">
          {countryCodes.map((country, index) => {
            const isSelected = selectedCode === country.code;
            
            return (
              <div 
                key={index}
                onClick={() => {
                  onSelect(country.code);
                  onClose();
                }}
                className={`flex items-center gap-6 px-8 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-4">
                  {country.flag}
                  <span className={`text-lg ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                    {country.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CountryCodeSelectionModal;
