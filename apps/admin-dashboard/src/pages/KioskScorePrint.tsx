import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Home, ArrowLeft } from 'lucide-react';

const KioskScorePrint = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>([]);

  const handleNumberClick = (num: string) => {
    if (code.length < 4) {
      setCode(prev => [...prev, num]);
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setCode([]);
  };

  const handleOK = () => {
    const enteredCode = code.join('');
    const savedCode = localStorage.getItem('golf_tablet_code');
    
    if (enteredCode === savedCode || enteredCode === '1234') { // Allow '1234' as fallback
      navigate('/user/kiosk/action');
    } else {
      alert('Kode tablet tidak valid. Silakan periksa kembali nomor yang ada di tablet Anda.');
      setCode([]);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Pattern / Image Placeholder */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1200&auto=format&fit=crop" 
          alt="Golf Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Kiosk Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <span className="font-black text-slate-800 text-sm tracking-tighter">GOLFINITY</span>
            <span className="font-black text-slate-800 text-sm tracking-tighter leading-none">SCORE</span>
            <div className="w-4 h-1 bg-slate-800 rounded-full mt-1" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
                <div className="w-5 h-4 flex flex-col rounded-sm overflow-hidden border border-slate-100">
                    <div className="flex-1 bg-red-600" />
                    <div className="flex-1 bg-white" />
                </div>
                <span className="text-xs font-bold text-slate-600">Bahasa Indonesia</span>
                <Settings size={14} className="text-slate-400 ml-2" />
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/')}
                  className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <Home size={22} />
                </button>
                <div className="p-2 text-slate-300">
                    <Settings size={24} />
                </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-12 pt-4 pb-12 flex flex-col items-center text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-500 tracking-[0.2em] uppercase leading-none">SCORE CARD</h2>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter mt-2">PRINT</h1>
            <div className="w-32 h-1.5 bg-slate-900 mx-auto mt-2" />
          </div>

          <div className="space-y-6 mb-12">
            <p className="text-2xl font-bold text-slate-800 max-w-sm mx-auto leading-tight">
                Masukkan 4 digit nomor yang ditampilkan di tablet
            </p>
            
            {/* 4 Digit Display */}
            <div className="flex gap-6 justify-center">
                {[0, 1, 2, 3].map((i) => (
                    <div 
                        key={i} 
                        className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${code[i] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-transparent'}`}
                    >
                        {code[i] && <span className="text-4xl font-black text-emerald-600">{code[i]}</span>}
                    </div>
                ))}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-6 gap-3 w-full mb-10">
            {[1, 2, 3, 4, 5].map(num => (
                <button 
                    key={num} 
                    onClick={() => handleNumberClick(num.toString())}
                    className="h-16 bg-white border border-slate-200 rounded-xl shadow-sm text-2xl font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                >
                    {num}
                </button>
            ))}
            <button 
                onClick={handleDelete}
                className="h-16 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
            >
                Hapus
            </button>
            {[6, 7, 8, 9, 0].map(num => (
                <button 
                    key={num} 
                    onClick={() => handleNumberClick(num.toString())}
                    className="h-16 bg-white border border-slate-200 rounded-xl shadow-sm text-2xl font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                >
                    {num}
                </button>
            ))}
            <button 
                onClick={handleClearAll}
                className="h-16 bg-white border border-slate-200 rounded-xl shadow-sm text-[10px] font-black uppercase text-slate-500 leading-tight hover:bg-slate-50 active:scale-95 transition-all"
            >
                Hapus<br/>Semua
            </button>
          </div>

          {/* OK Button */}
          <button 
            onClick={handleOK}
            disabled={code.length < 4}
            className={`w-full py-5 rounded-full text-3xl font-black transition-all shadow-xl ${code.length === 4 ? 'bg-emerald-400 text-white shadow-emerald-500/20 active:scale-[0.98]' : 'bg-emerald-100 text-white opacity-50 cursor-not-allowed'}`}
          >
            OK
          </button>

          {/* Footer Info */}
          <div className="mt-16 text-left w-full border-t border-emerald-100 pt-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Lupa nomor tablet Anda?</h3>
            <ol className="text-xs font-bold text-slate-500 space-y-2">
                <li>1. Kirim info ronde dan lihat di app GOLFINITYSCORE.</li>
                <li>2. Kirim nomor tablet ke smartphone Anda.</li>
            </ol>
            
            <div className="flex gap-4 mt-8">
                <button className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Cara Daftar Ronde Tablet
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Kirim Notifikasi ke Smartphone
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="relative z-10 mt-8 text-center text-white space-y-4">
        <p className="text-sm font-bold tracking-tight px-12">
            Reservasi, Shopping, Tur, Asuransi Golf<br/>
            Semuanya dalam Satu Aplikasi!
        </p>
        <div className="flex items-center justify-center gap-2 bg-blue-600 px-4 py-1.5 rounded-lg mx-auto w-fit shadow-lg">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-sm" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Install aplikasi GOLFINITYSCORE!</span>
        </div>
      </div>

      {/* Nav Buttons */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between">
        <button className="w-14 h-14 bg-emerald-600/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-all active:scale-90">
            <Home size={28} />
        </button>
        <button className="w-14 h-14 bg-emerald-600/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-all active:scale-90">
            <ArrowLeft size={28} />
        </button>
      </div>
    </div>
  );
};

export default KioskScorePrint;
