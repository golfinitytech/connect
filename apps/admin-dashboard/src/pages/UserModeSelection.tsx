import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Maximize } from 'lucide-react';

const modes = [
  {
    id: 'tournament',
    title: 'Tournament',
    subtitle: 'Mode Turnamen',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop',
    color: 'bg-green-600/20'
  },
  {
    id: 'caddie',
    title: 'Caddie',
    subtitle: 'Main Caddie',
    image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=800&auto=format&fit=crop',
    color: 'bg-orange-600/20'
  },
  {
    id: 'self',
    title: 'Self',
    subtitle: 'Main Solo',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop',
    color: 'bg-blue-600/20'
  }
];

const UserModeSelection = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0); // Default to Tournament (index 0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % modes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + modes.length) % modes.length);
  };

  const getMode = (indexOffset: number) => {
    const index = (currentIndex + indexOffset + modes.length) % modes.length;
    return modes[index];
  };

  const handleStartRound = () => {
    const currentMode = modes[currentIndex];
    if (currentMode.id === 'caddie') {
      // Use relative path to support multiple locations
      navigate('../caddie-mode');
    } else if (currentMode.id === 'tournament') {
      navigate('../tournament-selection');
    } else {
      // Handle other modes or show alert
      console.log('Start round for:', currentMode.title);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1a1a1a] overflow-hidden font-sans text-white select-none flex flex-col">
      {/* Background Image (Blurred) */}
      <div 
        className="absolute inset-0 bg-[#004741]"
      />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-3xl scale-110 transition-all duration-1000 mix-blend-overlay"
        style={{ backgroundImage: `url(${modes[currentIndex].image})` }}
      />

      {/* Header */}
      <div className="absolute top-4 md:top-8 w-full px-4 md:px-12 z-10 flex justify-between items-center">
        <p className="text-gray-200 text-sm md:text-2xl font-normal tracking-wide max-w-[60%] md:max-w-none">
          Tekan Round Start setelah memilih mode
        </p>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-2xl font-normal text-white hidden sm:block">GolfinityConnect</span>
            <img src="/logo1.png" alt="Golfinity" className="h-8 md:h-12 object-contain" />
          </div>
          <button 
            onClick={toggleFullScreen}
            className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all active:scale-90 shadow-lg"
            title="Toggle Fullscreen"
          >
            <Maximize size={16} className="text-white/80" />
          </button>
        </div>
      </div>

      {/* Main Content / Carousel */}
      <div className="relative flex-1 flex items-center justify-center pt-2 md:pt-4 mb-24 md:mb-32">
        <div className="relative w-full max-w-[1000px] h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] flex items-center justify-center">
          
          {modes.map((mode, idx) => {
            const isActive = idx === currentIndex;
            const isPrev = idx === (currentIndex - 1 + modes.length) % modes.length;
            const isNext = idx === (currentIndex + 1) % modes.length;
            
            if (!isActive && !isPrev && !isNext) return null;

            let translateX = '0';
            let scale = 'scale-100';
            let opacity = 'opacity-100';
            let zIndex = 'z-20';
            
            if (isPrev) {
              translateX = '-translate-x-[75%] sm:-translate-x-[85%] md:-translate-x-[110%]';
              scale = 'scale-75 sm:scale-[0.8] md:scale-75';
              opacity = 'opacity-50';
              zIndex = 'z-10';
            } else if (isNext) {
              translateX = 'translate-x-[75%] sm:translate-x-[85%] md:translate-x-[110%]';
              scale = 'scale-75 sm:scale-[0.8] md:scale-75';
              opacity = 'opacity-50';
              zIndex = 'z-10';
            }

            return (
              <div 
                key={idx}
                onClick={isActive ? handleStartRound : undefined}
                className={`absolute flex flex-col items-center transition-all duration-500 ease-out ${translateX} ${scale} ${opacity} ${zIndex} ${isActive ? 'cursor-pointer hover:scale-105' : ''}`}
              >
                {/* Kotak Latar Belakang (Menutupi blur/gambar sisa) */}
                <div className="absolute inset-0 bg-[#004741] -z-10 rounded-[50px] scale-125 md:scale-110" />

                <div className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                  isActive 
                    ? 'w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 border-[3px] border-[#66c2d4] shadow-[0_0_40px_rgba(102,194,212,0.6)]' 
                    : 'w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56'
                }`}>
                  <img 
                    src={mode.image} 
                    alt={mode.title} 
                    className={`w-full h-full object-cover transition-all duration-500 ${!isActive ? 'grayscale opacity-70' : ''}`}
                  />
                  
                  {/* Dark overlay for text readability */}
                  <div className={`absolute inset-0 transition-all duration-500 ${isActive ? 'bg-black/40' : 'bg-black/20'}`} />

                  {/* Active Text Inside Circle */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ${isActive ? 'opacity-100 z-20 scale-100' : 'opacity-0 -z-10 scale-90'}`}>
                    <h2 className="font-teko uppercase tracking-widest leading-none text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] text-[#ff7b5a] drop-shadow-[0_2px_15px_rgba(255,123,90,0.8)]">
                      {mode.title}
                    </h2>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium tracking-widest uppercase mt-1 sm:mt-1.5 text-white drop-shadow-md">
                      {mode.subtitle}
                    </p>
                  </div>
                </div>

                {/* Inactive Text Below Circle */}
                <div className={`mt-6 md:mt-8 text-center transition-all duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
                  <h2 className="font-teko uppercase tracking-widest leading-none drop-shadow-md text-2xl sm:text-3xl md:text-4xl text-white/70">
                    {mode.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base font-medium tracking-widest uppercase mt-2 text-white/50">
                    {mode.subtitle}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows Overlay */}
          <button 
            onClick={handlePrev}
            className="absolute left-1/2 -translate-x-[120px] sm:-translate-x-[140px] md:-translate-x-[180px] lg:-translate-x-[200px] top-[40%] sm:top-[42%] md:top-[42%] -translate-y-1/2 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30"
          >
            <ChevronLeft size={24} className="text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] sm:size-28 stroke-[3]" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-1/2 translate-x-[120px] sm:translate-x-[140px] md:translate-x-[180px] lg:translate-x-[200px] top-[40%] sm:top-[42%] md:top-[42%] -translate-y-1/2 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30"
          >
            <ChevronRight size={24} className="text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] sm:size-28 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Footer / Start Button */}
      <div className="absolute bottom-12 md:bottom-20 w-full flex justify-center px-4 z-40">
        <button 
          onClick={handleStartRound}
          className="group relative bg-[#4a72b8] hover:bg-[#3a5d99] px-10 py-3 sm:px-12 sm:py-3.5 md:px-16 md:py-4 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-[0_4px_15px_rgba(74,114,184,0.4)]"
        >
          <span className="text-sm sm:text-base md:text-lg font-bold tracking-wider text-white uppercase">Round Start</span>
        </button>
      </div>

      {/* Page Indicators */}
      <div className="absolute bottom-6 md:bottom-8 w-full flex justify-center gap-3">
        {modes.map((_, idx) => (
          <div 
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-[#ff6b4a]' : 'w-2 bg-[#2a3a3a]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default UserModeSelection;
