import React from 'react';

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
  selectedOption: string;
  options: string[];
}

const CourseSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedOption,
  options 
}: CourseSelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[320px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b text-center">
          <h2 className="text-xl font-bold text-gray-800">Pilih</h2>
        </div>
        
        <div className="py-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            
            return (
              <div 
                key={index}
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-lg ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionModal;
