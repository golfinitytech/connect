import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Home } from 'lucide-react';

const LocationSelectionPage = () => {
  const navigate = useNavigate();

  const locations = [
    {
      name: 'Palm Spring Golf Karawang',
      path: '/userpalmspringkarawang',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop',
      description: 'Akses sistem skor untuk lokasi Karawang.'
    },
    {
      name: 'Padang Golf Sulaiman',
      path: '/userpadanggolfsulaiman',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop',
      description: 'Akses sistem skor untuk lokasi Sulaiman.'
    },
    {
      name: 'Jatinangor National Golf',
      description: 'Akses sistem skor untuk lokasi Jatinangor.',
      path: '/userjatinangorgolf',
      image: '/images/jatinangor-golf.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <div className="absolute top-8 left-8 flex gap-4 z-20">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group bg-white/5 px-4 py-2 rounded-full border border-white/10"
        >
          <Home size={18} />
          <span className="font-bold uppercase tracking-widest text-[10px]">Menu Utama</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-600/20 mb-6">
            <MapPin size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic mb-4">
            PILIH <span className="text-emerald-500">LOKASI</span>
          </h1>
          <p className="text-slate-400 font-medium">Silakan pilih lapangan golf untuk memulai sesi Tablet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((loc, index) => (
            <button
              key={index}
              onClick={() => navigate(loc.path)}
              className="group relative h-80 rounded-[40px] overflow-hidden border-2 border-white/5 hover:border-emerald-500/50 transition-all duration-500 shadow-2xl hover:scale-[1.02] active:scale-95"
            >
              {/* Location Image */}
              <div className="absolute inset-0">
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-left">
                <h3 className="text-2xl font-black mb-2 tracking-tight leading-tight uppercase italic">
                  {loc.name}
                </h3>
                <p className="text-slate-300 text-sm font-medium mb-6 opacity-80">
                  {loc.description}
                </p>
                <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">
                  <span>Pilih Lokasi</span>
                  <div className="w-8 h-px bg-emerald-400 transition-all duration-300 group-hover:w-12" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-16 text-slate-600 text-[10px] font-bold tracking-[0.3em] uppercase">
          GOLFINITYSCORE &bull; MULTI-LOCATION SYSTEM
        </p>
      </div>
    </div>
  );
};

export default LocationSelectionPage;
