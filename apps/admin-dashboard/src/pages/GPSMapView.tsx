import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Map as MapIcon, 
  BarChart3, 
  Camera, 
  UtensilsCrossed, 
  Grid,
  Globe,
  PlayCircle,
  MapPin,
  Flag,
  Car,
  Plus
} from 'lucide-react';

const GPSMapView = () => {
  const navigate = useNavigate();
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentLang, setCurrentLang] = useState('ID');
  const [currentTime, setCurrentTime] = useState(new Date());

  // GPS Map Interaction States
  // Initialize with values from localStorage if available, otherwise default
  const [pinPosition, setPinPosition] = useState(() => {
    const saved = localStorage.getItem('golf_gps_pin_position');
    return saved ? JSON.parse(saved) : { x: 82, y: 35 };
  });
  
  const [targetPosition, setTargetPosition] = useState(() => {
    const saved = localStorage.getItem('golf_gps_target_position');
    return saved ? JSON.parse(saved) : { x: 45, y: 50 };
  });
  
  const [savedPinPosition, setSavedPinPosition] = useState(pinPosition); // Store saved state
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  // Define the fixed position for the ball (Tee Box)
  const ballPosition = { x: 20, y: 70 };

  // Calculate distance between two points (in percentage coordinates)
  // This is a simplified calculation for mockup purposes. 
  // In a real app, this would use actual lat/lng and Haversine formula
  const calculateMockDistance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    // Multiplier to convert percentage distance to mock meters (approximate scale)
    const distanceMultiplier = 5; 
    return Math.round(Math.sqrt(dx*dx + dy*dy) * distanceMultiplier);
  };

  const distanceToTarget = calculateMockDistance(ballPosition, targetPosition);
  const distanceToPin = calculateMockDistance(ballPosition, isEditingPin ? pinPosition : savedPinPosition);
  
  // Also calculate distance from target to pin if needed
  // const targetToPin = calculateMockDistance(targetPosition, isEditingPin ? pinPosition : savedPinPosition);

  // Save to localStorage whenever positions are updated and not in editing mode
  useEffect(() => {
    if (!isEditingPin) {
      localStorage.setItem('golf_gps_pin_position', JSON.stringify(savedPinPosition));
    }
  }, [savedPinPosition, isEditingPin]);

  useEffect(() => {
    if (!isEditingTarget) {
      localStorage.setItem('golf_gps_target_position', JSON.stringify(targetPosition));
    }
  }, [targetPosition, isEditingTarget]);

  // Handle map clicks and drags
  const handleMapInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!mapRef.current) return;
    
    // Only process if editing and interacting (mouse down or touch)
    if (!isEditingPin && !isEditingTarget) return;
    if ('buttons' in e && e.buttons !== 1 && e.type === 'mousemove') return;

    const rect = mapRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    if (isEditingPin) setPinPosition({ x, y });
    if (isEditingTarget) setTargetPosition({ x, y });
  };

  // Tablet Code State
  const [tabletCode, setTabletCode] = useState(() => {
    const savedCode = localStorage.getItem('golf_tablet_code');
    if (savedCode) return savedCode;
    // Generate random 4-digit code
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('golf_tablet_code', newCode);
    return newCode;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine which background to use based on current path
  const currentPath = window.location.pathname;
  const isPalmSprings = currentPath.includes('palmspringkarawang');
  const backgroundImage = isPalmSprings ? '/assets/palmspringkarawang.jpg' : '/assets/padanggolfsule.jpeg';

  useEffect(() => {
    const getBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        setBatteryLevel(Math.round(battery.level * 100));

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }
    };
    getBatteryStatus();
  }, []);

  // Broadcast location for monitoring
  useEffect(() => {
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const tabletCode = localStorage.getItem('golf_tablet_code') || 'Unknown Unit';
          const gpsData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().getTime(),
            isOnline: navigator.onLine,
            battery: batteryLevel
          };
          
          const allDevices = JSON.parse(localStorage.getItem('golf_devices_gps') || '{}');
          allDevices[tabletCode] = gpsData;
          localStorage.setItem('golf_devices_gps', JSON.stringify(allDevices));
        },
        null,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    return () => navigator.geolocation.clearWatch(watchId);
  }, [batteryLevel]);

  return (
    <div className="flex flex-col h-screen bg-[#0a1a0a] text-white font-sans overflow-hidden">
      {/* Top Header */}
      <header className="bg-[#1a1a1a] flex items-center justify-between px-6 h-16 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Hole</span>
              <span className="text-xl font-black">2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Par</span>
              <span className="text-xl font-black">4</span>
            </div>
          </div>
          
          <div className="h-10 w-[1px] bg-slate-700" />
          
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Index</span>
                <div className="flex items-center gap-2">
                   <div className="flex gap-0.5">
                      <div className="w-1.5 h-4 bg-blue-500" />
                      <div className="w-1.5 h-4 bg-green-500" />
                   </div>
                   <span className="text-xl font-black">11</span>
                </div>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-blue-400 uppercase">Avg.</span>
                <span className="text-xl font-black">5.36</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-red-400 uppercase">Avg.</span>
                <span className="text-xl font-black">5.64</span>
             </div>
          </div>

          {/* Progress Bar Top */}
          <div className="flex flex-col items-center min-w-[200px] ml-4">
             <div className="bg-blue-600 px-4 py-0.5 rounded-full text-[10px] font-black mb-1">305</div>
             <div className="w-full h-1 bg-slate-700 rounded-full relative">
                <div className="absolute top-0 left-0 h-full w-[60%] bg-green-500 rounded-full" />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">339</div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">The Tomorrow of Golf</span>
            <span className="text-xl font-black tracking-tighter italic text-white">GOLFINITYSCORE</span>
          </div>
          <div 
            onClick={() => setCurrentLang(prev => prev === 'ID' ? 'EN' : 'ID')}
            className="flex flex-col items-center border-l border-slate-700 pl-4 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Globe size={18} className="text-slate-400" />
            <span className="text-[8px] font-bold text-slate-400 uppercase">{currentLang}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* GPS Map Area */}
        <div 
          ref={mapRef}
          className={`flex-1 relative bg-[#1e3a1e] overflow-hidden ${isEditingPin || isEditingTarget ? 'cursor-crosshair' : ''}`}
          onMouseMove={handleMapInteraction}
          onMouseDown={handleMapInteraction}
          onTouchMove={handleMapInteraction}
          onTouchStart={handleMapInteraction}
        >
          {/* Mock Map Image Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          
          {/* Map Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

          {/* Ball, Line, Target Crosshair, and Flag elements */}
          <div className="absolute inset-0">
             {/* 1. Bola Putih di kiri bawah */}
             <div className="absolute bottom-[30%] left-[20%] w-6 h-6 bg-white rounded-full shadow-lg shadow-white/50 border-2 border-slate-200 z-10" />
             
             {/* 2. Garis Putih tipis dari bola ke bendera */}
             <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
               {/* Garis dari bola ke target */}
               <line x1="20%" y1="70%" x2={`${targetPosition.x}%`} y2={`${targetPosition.y}%`} stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
               {/* Garis dari target ke pin (use saved pin unless editing) */}
               <line x1={`${targetPosition.x}%`} y1={`${targetPosition.y}%`} x2={`${isEditingPin ? pinPosition.x : savedPinPosition.x}%`} y2={`${isEditingPin ? pinPosition.y : savedPinPosition.y}%`} stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
             </svg>

             {/* 3. Crosshair (+) di tengah jalur (Bisa digeser) */}
             <div 
               className={`absolute w-10 h-10 -ml-5 -mt-5 border-2 border-white/80 rounded-full flex items-center justify-center bg-black/10 transition-colors shadow-lg backdrop-blur-sm z-40 pointer-events-auto ${isEditingTarget ? 'scale-125 bg-white/20 border-white ring-4 ring-white/30 cursor-move' : 'cursor-pointer hover:bg-black/20'}`}
               style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y}%` }}
               onClick={(e) => { e.stopPropagation(); setIsEditingTarget(!isEditingTarget); setIsEditingPin(false); }}
             >
               <Plus className="text-white" size={24} />
             </div>

             {/* 4. Gocar dan Bendera */}
             <div 
                className={`absolute flex flex-col items-center gap-1 -ml-6 -mt-10 transition-transform ${isEditingPin ? 'scale-125 z-30 cursor-move' : 'z-10'}`}
                style={{ left: `${isEditingPin ? pinPosition.x : savedPinPosition.x}%`, top: `${isEditingPin ? pinPosition.y : savedPinPosition.y}%` }}
             >
               <div className="drop-shadow-lg -mb-2">
                 <img src="/assets/gocargolf.png" alt="Golf Cart" className="w-10 h-10 object-contain drop-shadow-xl" />
               </div>
               <div className="relative">
                 <Flag size={28} className="text-white drop-shadow-md" fill="white" />
                 <div className="absolute -bottom-2 -left-4 w-12 h-4 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full opacity-60 blur-sm blur-md" />
               </div>
             </div>
          </div>

          {/* Distance Markers */}
          <div 
             className="absolute flex gap-4 animate-in fade-in zoom-in duration-500 z-30 transition-all pointer-events-none"
             style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y - 15}%`, transform: 'translate(-50%, -50%)' }}
          >
             <div className="flex flex-col items-center">
                <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1 rounded-t-lg text-[10px] font-bold">ke Target</div>
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-b-lg border border-white/10">
                   <span className="text-3xl font-black">{distanceToTarget}m</span>
                </div>
             </div>
             <div className="flex flex-col items-center">
                <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1 rounded-t-lg text-[10px] font-bold">ke Pin</div>
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-b-lg border border-white/10">
                   <span className="text-3xl font-black">{distanceToPin}m</span>
                </div>
             </div>
          </div>

          {/* Meter/Yard Toggle */}
          <div className="absolute top-10 left-40 bg-black/40 backdrop-blur-md rounded-full p-1 flex items-center gap-2 border border-white/10">
             <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">m</div>
             <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-slate-400">y</div>
          </div>

          {/* Big Distance Display */}
          <div className="absolute top-10 left-10 flex items-center gap-4">
             <span className="text-8xl font-black text-white/90 drop-shadow-2xl">{distanceToPin}</span>
             <div className="bg-red-600/80 p-2 rounded-lg">
                <div className="w-8 h-6 bg-white/20 rounded-sm" />
             </div>
          </div>

          {/* Bottom Left Controls */}
          <div 
             className="absolute bottom-10 left-10 flex gap-4 z-40"
             onMouseDown={(e) => e.stopPropagation()}
             onTouchStart={(e) => e.stopPropagation()}
          >
             <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  if (isEditingPin) {
                    setSavedPinPosition(pinPosition); // Save the new position
                  } else {
                    setPinPosition(savedPinPosition); // Restore before editing
                  }
                  setIsEditingPin(!isEditingPin); 
                  setIsEditingTarget(false); 
                }}
                className={`backdrop-blur-md border px-6 py-3 rounded-xl flex items-center gap-3 transition-all ${isEditingPin ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'bg-black/40 border-white/10 hover:bg-black/60'}`}
             >
                <MapPin size={20} className={isEditingPin ? 'text-white' : 'text-slate-300'} />
                <span className="font-bold">{isEditingPin ? 'Simpan Posisi Pin' : 'Ubah posisi pin green'}</span>
             </button>
             <button className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-black/60 transition-all">
                <PlayCircle size={20} className="text-slate-300" />
                <span className="font-bold">Video</span>
             </button>
          </div>
          
          {/* Instructions Overlay */}
          {(isEditingPin || isEditingTarget) && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white font-bold animate-in fade-in slide-in-from-top-4 z-40 pointer-events-none">
              Geser jari di layar atau klik peta untuk memindahkan {isEditingPin ? 'Pin Green' : 'Target'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Navigation */}
      <footer className="h-16 bg-[#1e293b] text-white flex items-center justify-between px-6 shrink-0 border-t border-white/5">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('../caddie-mode', { state: { view: 'dashboard' } })}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
          >
            <Menu size={28} className="text-slate-400 group-hover:text-white" />
          </button>
          
          <div className="flex items-center gap-10 border-l border-slate-700 pl-8 h-8">
            <button 
              onClick={() => navigate('../scorecard')}
              className="flex items-center gap-2 group"
            >
              <span className="text-lg font-black text-slate-400 group-hover:text-white uppercase tracking-tighter">Skor</span>
            </button>
            <button className="flex items-center gap-2 group">
              <span className="text-lg font-black text-white uppercase tracking-tighter">Peta GPS</span>
            </button>
            <button className="flex items-center gap-2 group">
              <BarChart3 size={20} className="text-slate-400 group-hover:text-white" />
              <span className="text-lg font-black text-slate-400 group-hover:text-white uppercase tracking-tighter">Klasemen</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-6 mr-6">
            <Camera size={24} className="text-slate-400 cursor-pointer hover:text-white" />
            <UtensilsCrossed size={24} className="text-slate-400 cursor-pointer hover:text-white" />
            <Grid size={24} className="text-slate-400 cursor-pointer hover:text-white" />
          </div>
          <div className="bg-[#0f172a] rounded-lg p-1 px-3 border border-emerald-500/50 flex flex-col items-center relative">
            <div className="absolute -top-3 bg-blue-600 text-[8px] font-bold px-2 rounded-full uppercase">Otomatis</div>
            <span className="text-2xl font-black text-emerald-400 tracking-widest">{tabletCode}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] ml-4">
            <div className="flex gap-3 uppercase">
              <span>Out 00:00</span>
              <span>In 00:00</span>
            </div>
            <span className="text-white">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            <div className="w-8 h-4 border border-white/30 rounded-sm flex items-center px-0.5 relative">
              <div 
                className={`h-2.5 rounded-sm transition-all duration-500 ${batteryLevel < 20 ? 'bg-red-500' : 'bg-emerald-400'}`}
                style={{ width: `${batteryLevel}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[6px] text-white font-black">{batteryLevel}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GPSMapView;
