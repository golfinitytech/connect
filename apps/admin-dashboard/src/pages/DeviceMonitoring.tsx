import React, { useState, useEffect } from 'react';
import { MapPin, Smartphone, Wifi, Battery, Clock, RefreshCw } from 'lucide-react';

interface DeviceGPS {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  isOnline: boolean;
  battery: number;
}

const DeviceMonitoring = () => {
  const [devices, setDevices] = useState<Record<string, DeviceGPS>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadGpsData = () => {
    setIsLoading(true);
    const saved = localStorage.getItem('golf_devices_gps');
    if (saved) {
      setDevices(JSON.parse(saved));
    }
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    loadGpsData();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'golf_devices_gps') {
        loadGpsData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const deviceIds = Object.keys(devices);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-primary" />
          Real-time Device Monitoring (GPS)
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total Devices: {deviceIds.length}
          </span>
          <button 
            onClick={loadGpsData}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh Positions
          </button>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deviceIds.length > 0 ? (
          deviceIds.map((id) => (
            <DeviceCard key={id} id={id} data={devices[id]} />
          ))
        ) : (
          <div className="col-span-full bg-white p-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <Smartphone size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest">No devices currently broadcasting GPS</p>
            <p className="text-sm">Ensure GPS is active on tablet devices.</p>
          </div>
        )}
      </div>

      {/* Map View Placeholder */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-black uppercase tracking-tighter text-slate-700">Fleet View Map</h3>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-bold text-gray-500">Active Units</span>
           </div>
        </div>
        <div className="aspect-video bg-slate-100 rounded-xl relative overflow-hidden border border-gray-200">
           <div 
             className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1600&auto=format&fit=crop')` }}
           />
           {/* Markers */}
           {deviceIds.map((id, idx) => (
             <div 
               key={id}
               className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 animate-bounce"
               style={{ 
                 top: `${40 + (idx * 5)}%`, 
                 left: `${30 + (idx * 10)}%` 
               }}
             >
               <div className="relative">
                  <MapPin size={32} className="text-red-600 fill-red-200" />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl">
                     UNIT {id}
                  </div>
               </div>
             </div>
           ))}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/40 shadow-2xl text-center">
                 <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Interactive Map Ready</p>
                 <p className="text-[10px] text-slate-500 font-bold">Monitoring {deviceIds.length} tablets in Palm Springs Karawang</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const DeviceCard = ({ id, data }: { id: string; data: DeviceGPS }) => {
  const lastSeen = new Date(data.timestamp).toLocaleTimeString();
  const isStale = new Date().getTime() - data.timestamp > 30000; // Stale after 30s

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Smartphone size={20} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 tracking-tighter uppercase">Unit {id}</h4>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${data.isOnline && !isStale ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                {data.isOnline && !isStale ? 'Connected' : 'Offline / Stale'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
          <Battery size={12} className={data.battery < 20 ? 'text-red-500' : 'text-emerald-500'} />
          <span className="text-[10px] font-black text-slate-600">{data.battery}%</span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} /> Position
          </span>
          <span className="text-slate-700">{data.lat.toFixed(6)}, {data.lng.toFixed(6)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Wifi size={10} /> Accuracy
          </span>
          <span className="text-slate-700">{data.accuracy.toFixed(1)}m</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Clock size={10} /> Last Update
          </span>
          <span className="text-slate-700">{lastSeen}</span>
        </div>
      </div>

      <div className="mt-6">
        <button className="w-full bg-slate-50 hover:bg-slate-100 py-2 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] transition-all">
          Locate Unit
        </button>
      </div>
    </div>
  );
};

export default DeviceMonitoring;
