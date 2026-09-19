import React, { useState } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordModal = ({ isOpen, onClose, onSuccess }: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Default password '1234'
    if (password === '1234') {
      onSuccess();
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-8 flex flex-col items-center gap-8">
        <h2 className="text-2xl font-bold text-slate-800">Masukkan kata sandi.</h2>
        
        <div className="w-full space-y-2">
          <input 
            type="password"
            placeholder="Silakan tulis kata sandi."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`w-full border-2 ${error ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-4 text-center text-lg outline-none focus:border-blue-500 transition-colors text-slate-900 placeholder:text-slate-400`}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm font-bold text-center">Kata sandi salah!</p>}
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border-2 border-blue-500 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
