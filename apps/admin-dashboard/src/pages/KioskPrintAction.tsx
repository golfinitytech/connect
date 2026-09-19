import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Smartphone, Printer, ArrowLeft } from 'lucide-react';

const KioskPrintAction = () => {
  const navigate = useNavigate();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-blue-700 flex flex-col items-center font-sans text-white relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-blue-900/60" />

      {/* Content Layer */}
      <div className="relative z-10 w-full flex flex-col items-center min-h-screen">
        {/* Header */}
        <div className="w-full px-12 py-10">
          <div className="flex flex-col items-start">
            <span className="font-black text-white text-xl italic tracking-tighter uppercase">GOLFINITYSCORE</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 w-full max-w-4xl mx-auto">
          <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">
            Print Your Scorecard
          </h1>

          <div className="flex flex-col items-center gap-12 w-full">
            {/* Action Button */}
            <button 
              onClick={handlePrint}
              disabled={isPrinting}
              className={`group relative rounded-[50px] px-20 py-16 flex flex-col items-center justify-center gap-4 transition-all active:scale-95 shadow-xl ${
                isPrinting ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              <div className={`p-6 bg-white/10 rounded-full ${isPrinting ? 'animate-bounce' : 'animate-pulse'}`}>
                {isPrinting ? <Printer size={80} /> : <Fingerprint size={80} />}
              </div>
              <span className="text-4xl font-black tracking-widest uppercase">
                {isPrinting ? 'PRINTING...' : 'TOUCH HERE'}
              </span>
            </button>
            
            <p className="text-white/60 font-bold uppercase tracking-widest">
              {isPrinting ? 'Please wait...' : 'Press button above to print'}
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-8 w-full mt-20 text-left pb-10">
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <Smartphone size={24} className="text-blue-400" />
                <h4 className="font-black uppercase tracking-wider">Mobile App</h4>
              </div>
              <p className="text-sm text-blue-100 font-bold">
                Sync with GOLFINITYSCORE app.
              </p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <Printer size={24} className="text-emerald-400" />
                <h4 className="font-black uppercase tracking-wider">Direct Print</h4>
              </div>
              <p className="text-sm text-blue-100 font-bold">
                High quality printouts.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <button 
          onClick={() => navigate('/user/kiosk/print')}
          className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-20"
        >
          <ArrowLeft size={32} />
        </button>
      </div>
    </div>
  );
};

export default KioskPrintAction;
