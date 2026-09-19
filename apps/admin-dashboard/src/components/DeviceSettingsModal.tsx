import React, { useState, useEffect, useRef } from 'react';

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

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

const DeviceSettingsModal = ({ isOpen, onClose, currentLang, onLangChange }: DeviceSettingsModalProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('deviceSettings');
    return saved ? JSON.parse(saved) : {
      lte: true,
      wifi: false,
      gps: true,
    };
  });

  const watchId = useRef<number | null>(null);

  // Connection Status
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('deviceSettings', JSON.stringify(settings));
  }, [settings]);

  // Real GPS Logic
  useEffect(() => {
    if (settings.gps) {
      if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          async (position) => {
            const tabletCode = localStorage.getItem('golf_tablet_code') || 'Unknown Device';
            
            let batteryLevel = 0;
            if ('getBattery' in navigator) {
              // @ts-ignore
              const battery = await navigator.getBattery();
              batteryLevel = Math.round(battery.level * 100);
            }

            const gpsData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().getTime(),
              isOnline: navigator.onLine,
              battery: batteryLevel
            };

            // Save to shared monitoring key
            const allDevicesGps = JSON.parse(localStorage.getItem('golf_devices_gps') || '{}');
            allDevicesGps[tabletCode] = gpsData;
            localStorage.setItem('golf_devices_gps', JSON.stringify(allDevicesGps));

            console.log(`GPS Updated for ${tabletCode}:`, gpsData);
          },
          (error) => {
            console.error("GPS Error:", error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [settings.gps]);

  if (!isOpen) return null;

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl text-white animate-in fade-in zoom-in duration-300 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-4xl font-bold text-white/90 tracking-tight">Pengaturan Perangkat</h2>
          <div className={`w-3 h-3 rounded-full mt-2 ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
        </div>
        
        <div className="w-full max-w-2xl space-y-12">
          {/* Toggles Area */}
          <div className="space-y-8 px-10">
            <div className="flex items-center gap-20 text-2xl font-bold">
              <span className="text-white/70 w-32">Data LTE</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleSetting('lte')}
                  className={`w-16 h-8 rounded-full transition-colors relative ${settings.lte ? 'bg-blue-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.lte ? 'right-1' : 'left-1'}`} />
                </button>
                {settings.lte && <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Active</span>}
              </div>
            </div>

            <div className="flex items-center gap-20 text-2xl font-bold">
              <span className="text-white/70 w-32">Wifi</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleSetting('wifi')}
                  className={`w-16 h-8 rounded-full transition-colors relative ${settings.wifi ? 'bg-blue-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.wifi ? 'right-1' : 'left-1'}`} />
                </button>
                {settings.wifi && <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Active</span>}
              </div>
            </div>

            <div className="flex items-center gap-20 text-2xl font-bold">
              <span className="text-white/70 w-32">GPS</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleSetting('gps')}
                  className={`w-16 h-8 rounded-full transition-colors relative ${settings.gps ? 'bg-blue-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.gps ? 'right-1' : 'left-1'}`} />
                </button>
                {settings.gps && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Tracking</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Language Grid */}
          <div className="flex gap-10 items-start">
            <span className="text-2xl font-bold text-white/70 pt-2 w-32 shrink-0">Language</span>
            <div className="flex-1 grid grid-cols-4 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLangChange(lang.code)}
                  className={`
                    px-4 py-4 rounded-xl text-lg font-bold transition-all border-2
                    ${currentLang === lang.code 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30' 
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-500 text-white px-20 py-4 rounded-xl text-2xl font-bold shadow-xl shadow-blue-600/30 transition-all active:scale-95"
            >
              TUTUP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettingsModal;
