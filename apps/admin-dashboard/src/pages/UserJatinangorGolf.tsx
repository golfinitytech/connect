import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home, MapPin } from 'lucide-react';
import GPSInstructionModal from '../components/GPSInstructionModal';

const UserJatinangorGolf = () => {
  const navigate = useNavigate();
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'active' | 'error' | 'permission-denied' | 'position-unavailable'>('requesting');
  const [retryCount, setRetryCount] = useState(0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  useEffect(() => {
    let watchId: number;
    const startTracking = (highAccuracy = true) => {
      setGpsStatus('requesting');
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setGpsStatus('active');
            const tabletCode = localStorage.getItem('golf_tablet_code') || 'Unit-Jatinangor';
            const gpsData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().getTime(),
              isOnline: navigator.onLine,
              battery: 100
            };
            const allDevices = JSON.parse(localStorage.getItem('golf_devices_gps') || '{}');
            allDevices[tabletCode] = gpsData;
            localStorage.setItem('golf_devices_gps', JSON.stringify(allDevices));
          },
          (err) => {
            console.error(`GPS Error (HighAccuracy: ${highAccuracy}):`, err);
            if (err.code === 1) setGpsStatus('permission-denied');
            else if (err.code === 2) {
              setGpsStatus('position-unavailable');
              if (highAccuracy) {
                navigator.geolocation.clearWatch(watchId);
                startTracking(false);
              }
            }
            else if (err.code === 3) {
              console.warn("GPS Timeout, retrying...");
              if (highAccuracy) {
                navigator.geolocation.clearWatch(watchId);
                startTracking(false);
              }
            }
            else setGpsStatus('error');
          },
          { enableHighAccuracy: highAccuracy, timeout: 20000, maximumAge: 0 }
        );
      }
    };
    startTracking(true);
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [retryCount]);

  return (
    <div className="relative min-h-screen w-full bg-[#1a1a1a] overflow-hidden font-sans text-white select-none flex flex-col">
      {/* GPS Status Indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${
          gpsStatus === 'active' ? 'bg-emerald-500/20 border-emerald-500/50' : 
          gpsStatus === 'requesting' ? 'bg-blue-500/20 border-blue-500/50' :
          'bg-red-500/20 border-red-500/50'
        }`}>
          <MapPin size={14} className={gpsStatus === 'active' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {gpsStatus === 'active' ? 'GPS Active & Monitoring' : 
             gpsStatus === 'permission-denied' ? 'GPS Permission Denied' :
             gpsStatus === 'position-unavailable' ? 'GPS Signal Not Found' :
             gpsStatus === 'error' ? 'GPS Error - Check Hardware' : 'Requesting GPS...'}
          </span>
        </div>

        {(gpsStatus === 'permission-denied' || gpsStatus === 'position-unavailable') && (
          <button 
            onClick={() => {
              if (gpsStatus === 'permission-denied') setIsInstructionOpen(true);
              else setRetryCount(prev => prev + 1);
            }}
            className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 animate-bounce"
          >
            {gpsStatus === 'permission-denied' ? 'Cara Mengizinkan GPS' : 'Coba Lagi / Aktifkan Lokasi Perangkat'}
          </button>
        )}
      </div>

      <GPSInstructionModal 
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        onRetry={() => setRetryCount(prev => prev + 1)}
      />

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('/images/jatinangor-golf.jpg')`,
          filter: 'brightness(0.7)'
        }}
      />

      {/* Home Button Top Right */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 z-20 hover:bg-white/20 transition-all active:scale-90 shadow-lg"
        title="Kembali ke Menu Utama"
      >
        <Home size={16} className="text-white/80" />
      </button>
      
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
        <div className="text-center scale-50 md:scale-100">
          <div className="text-8xl font-black tracking-tighter">GOLFINITY</div>
          <div className="text-6xl font-black tracking-[0.5em] -mt-4">SCORE</div>
        </div>
      </div>

      {/* Top Left Logo (Placeholder for Jatinangor) */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 z-10">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 p-2">
           <span className="font-black text-white text-lg">J</span>
        </div>
        <div className="text-[8px] md:text-[10px] font-bold tracking-widest text-white/80 uppercase">
          Jatinangor
          <div className="text-[6px] md:text-[8px] font-normal tracking-normal opacity-60 uppercase">National Golf</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center md:justify-end px-6 sm:px-16 md:px-32">
        <div className="max-w-md w-full space-y-6 md:space-y-8 text-center md:text-left">
          {/* Header Text */}
          <div className="space-y-2">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-lg md:text-xl font-bold tracking-widest text-white/90 uppercase">GOLFINITYSCORE</span>
              <div className="h-0.5 w-12 bg-blue-500 mt-1"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Round Control<br className="hidden sm:block" /> Solution
            </h1>
          </div>

          {/* Features List */}
          <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
            {[
              { name: "Hole Yardage & Layout", path: null },
              { name: "Club Panorama View", path: null },
              { name: "Club Summary", path: null }
            ].map((feature, index) => (
              <div 
                key={index} 
                onClick={() => feature.path && navigate(feature.path)}
                className={`flex items-center gap-4 justify-center md:justify-start group ${feature.path ? 'cursor-pointer hover:translate-x-2 transition-transform' : 'cursor-default'}`}
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/40 group-hover:bg-blue-500/40 group-hover:border-blue-400 transition-colors">
                  <ChevronRight size={14} className="text-blue-400 md:size-4 group-hover:text-white" />
                </div>
                <span className="text-base md:text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                  {feature.name}
                </span>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <div className="pt-6 md:pt-8 flex justify-center md:justify-start">
            <button 
              onClick={() => navigate('./mode-selection')}
              className="group relative bg-blue-600 hover:bg-blue-500 px-8 py-3.5 md:px-10 md:py-4 rounded-full flex items-center gap-3 md:gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/30"
            >
              <span className="text-lg md:text-xl font-bold tracking-wider uppercase">Mulai Ronde</span>
              <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ChevronRight size={18} className="fill-current md:size-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-right opacity-40">
        <div className="text-[10px] md:text-xs font-bold tracking-widest">GOLFINITY</div>
        <div className="text-[6px] md:text-[8px] tracking-[0.2em] -mt-1 flex items-center justify-end gap-1">
          SCORE <span className="text-[5px] md:text-[6px] border border-white/60 px-0.5 leading-none">R</span>
        </div>
      </div>
    </div>
  );
};

export default UserJatinangorGolf;
