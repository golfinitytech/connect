import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface Language {
  code: string;
  label: string;
}

const languages: Language[] = [
  { code: 'KO', label: '한국어 (KO)' },
  { code: 'EN', label: 'English (EN)' },
  { code: 'JA', label: '日本語 (JA)' },
  { code: 'VI', label: 'Tiếng Việt (VI)' },
  { code: 'TH', label: 'ภาษาไทย (TH)' },
  { code: 'ID', label: 'Indonesia (ID)' },
  { code: 'TW', label: '繁體中文 (TW)' },
  { code: 'CN', label: '简体中文 (CN)' },
];

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lang: string) => void;
  currentLang: string;
}

const LanguageModal = ({ isOpen, onClose, onSelect, currentLang }: LanguageModalProps) => {
  const [selected, setSelected] = useState(currentLang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#f5f5f5] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Bahasa</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className={`
                  relative px-4 py-4 rounded-xl text-lg font-medium transition-all border-2
                  ${selected === lang.code 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                {lang.label}
                {selected === lang.code && (
                  <div className="absolute top-1 right-1 bg-white/20 rounded-full p-0.5">
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center gap-4 mt-10">
            <button 
              onClick={onClose}
              className="px-10 py-3 rounded-xl bg-white border-2 border-blue-600 text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors min-w-[140px]"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
              className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 min-w-[140px]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
