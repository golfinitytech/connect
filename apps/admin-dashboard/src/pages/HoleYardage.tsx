import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Video, X, RotateCcw, Play, Pause } from 'lucide-react';

const HoleYardage = () => {
  const navigate = useNavigate();
  const [unit, setUnit] = useState<'Meter' | 'Yard'>('Meter');
  const [half, setHalf] = useState<'OUT' | 'IN'>('OUT');
  const [selectedHole, setSelectedHole] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const courseData = {
    OUT: {
      par: [4, 4, 3, 5, 4, 3, 4, 5, 4],
      hcp: [7, 15, 17, 1, 9, 13, 3, 11, 5],
      black: [372, 342, 188, 485, 349, 172, 414, 540, 381],
      blue: [349, 320, 168, 456, 331, 159, 383, 503, 353],
      white: [332, 306, 148, 423, 311, 141, 351, 473, 331],
      red: [317, 287, 130, 388, 292, 110, 299, 450, 313],
    },
    IN: {
      par: [4, 5, 4, 3, 4, 4, 3, 4, 5],
      hcp: [8, 16, 18, 2, 10, 14, 4, 12, 6],
      black: [380, 510, 390, 160, 400, 370, 180, 420, 530],
      blue: [360, 490, 370, 150, 380, 350, 170, 400, 510],
      white: [340, 470, 350, 140, 360, 330, 160, 380, 490],
      red: [320, 450, 330, 130, 340, 310, 150, 360, 470],
    }
  };

  const currentData = courseData[half];
  const holeNumbers = half === 'OUT' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  const calculateTotal = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const toggleVideo = (holeNum: number | null) => {
    setSelectedHole(holeNum);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1a1a1a] text-white font-sans flex flex-col overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1600&auto=format&fit=crop')` }}
      />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold">Hole Yardage & Layout</h1>
        </div>
        
        {/* Logo Placeholder */}
        <div className="bg-white p-2 rounded-lg">
          <div className="w-16 h-10 flex flex-col items-center justify-center text-[8px] text-gray-800 font-bold border border-gray-200">
            <span className="leading-tight">PALMSPRINGS</span>
            <span className="text-[6px] font-normal leading-tight">golf & beach club</span>
            <span className="text-[6px] font-normal leading-tight">karawang</span>
          </div>
        </div>
      </header>

      {/* Toggles */}
      <div className="relative z-10 px-8 mb-4 flex justify-between items-center">
        {/* Unit Toggle */}
        <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1">
          <button 
            onClick={() => setUnit('Meter')}
            className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${unit === 'Meter' ? 'bg-white text-gray-800' : 'text-white/60'}`}
          >
            Meter
          </button>
          <button 
            onClick={() => setUnit('Yard')}
            className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${unit === 'Yard' ? 'bg-white text-gray-800' : 'text-white/60'}`}
          >
            Yard
          </button>
        </div>

        {/* Half Toggle */}
        <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1">
          <button 
            onClick={() => setHalf('OUT')}
            className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${half === 'OUT' ? 'bg-blue-600 text-white' : 'text-white/60'}`}
          >
            OUT
          </button>
          <button 
            onClick={() => setHalf('IN')}
            className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${half === 'IN' ? 'bg-blue-600 text-white' : 'text-white/60'}`}
          >
            IN
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="relative z-10 flex-1 px-8 pb-8 overflow-hidden">
        <div className="w-full h-full bg-white/95 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-200">
                <th className="py-4 px-4 text-left font-bold flex items-center gap-2">
                  Hole
                </th>
                {holeNumbers.map(num => (
                  <th 
                    key={num} 
                    className="py-4 text-center font-bold cursor-pointer hover:text-blue-600 hover:bg-gray-200/50 transition-all group relative"
                    onClick={() => toggleVideo(num)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{num}</span>
                      <Video size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                ))}
                <th className="py-4 px-6 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 font-medium">
              {/* Par Row */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-left font-bold text-gray-800">Par</td>
                {currentData.par.map((val, idx) => (
                  <td key={idx} className="py-4 text-center text-blue-500 font-bold">{val}</td>
                ))}
                <td className="py-4 px-6 text-right font-bold text-gray-800">{calculateTotal(currentData.par)}</td>
              </tr>
              {/* Handicap Row */}
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <td className="py-4 px-4 text-left font-bold text-gray-800">Hcp</td>
                {currentData.hcp.map((val, idx) => (
                  <td key={idx} className="py-4 text-center text-gray-500 italic">{val}</td>
                ))}
                <td className="py-4 px-6 text-right font-bold text-gray-800">-</td>
              </tr>
              {/* Black Row */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-left font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded-full" />
                  Black
                </td>
                {currentData.black.map((val, idx) => (
                  <td key={idx} className="py-4 text-center">{val}</td>
                ))}
                <td className="py-4 px-6 text-right font-bold text-gray-800">{calculateTotal(currentData.black)}</td>
              </tr>
              {/* Blue Row */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-left font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  Blue
                </td>
                {currentData.blue.map((val, idx) => (
                  <td key={idx} className="py-4 text-center">{val}</td>
                ))}
                <td className="py-4 px-6 text-right font-bold text-gray-800">{calculateTotal(currentData.blue)}</td>
              </tr>
              {/* White Row */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-left font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded-full" />
                  White
                </td>
                {currentData.white.map((val, idx) => (
                  <td key={idx} className="py-4 text-center">{val}</td>
                ))}
                <td className="py-4 px-6 text-right font-bold text-gray-800">{calculateTotal(currentData.white)}</td>
              </tr>
              {/* Red Row */}
              <tr>
                <td className="py-4 px-4 text-left font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full" />
                  Red
                </td>
                {currentData.red.map((val, idx) => (
                  <td key={idx} className="py-4 text-center">{val}</td>
                ))}
                <td className="py-4 px-6 text-right font-bold text-gray-800">{calculateTotal(currentData.red)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {selectedHole !== null && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Video Header */}
          <div className="absolute top-0 left-0 w-full z-[110] p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <h2 className="text-white text-2xl font-bold">Hole {selectedHole} - Layout Video</h2>
            <button 
              onClick={() => setSelectedHole(null)}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
            >
              <X size={28} className="text-white" />
            </button>
          </div>

          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              key={selectedHole} // Force re-render on hole change
            >
              <source src={`/videos/hole-${selectedHole}.mp4`} type="video/mp4" />
              <source src="/videos/hole-yardage.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-[105]"
              >
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                  <Play size={48} className="text-white fill-current ml-2" />
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 w-full z-[110] p-8 flex justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-500 transition-all active:scale-95"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <button 
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
            >
              <RotateCcw size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoleYardage;
