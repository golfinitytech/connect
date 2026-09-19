import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ClubSummary = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-[#1a1a1a] text-white font-sans flex flex-col overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1600&auto=format&fit=crop')` }}
      />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold">Club Summary</h1>
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

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row p-8 gap-8 overflow-hidden">
        {/* Left Spacer / Potential Image Area */}
        <div className="hidden md:block flex-1" />

        {/* Content Card (Right Side as per image) */}
        <div className="flex-1 bg-white/95 backdrop-blur-md rounded-3xl p-8 text-gray-800 shadow-2xl overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900">Palm Springs Karawang</h2>
              <div className="h-1 w-20 bg-blue-600"></div>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Palm Springs Golf & Country Club Karawang Course, formerly known as Sedana Golf & Country Club. 
              Palm Springs Golf and Country Club Karawang Course is an international designed 18-hole golf course 
              and has club facility within an exclusive residential community. The course is designed by Mark F. 
              Rather of the Rather International Golf Design, Inc., USA, who believes in creating 
              environmentally responsible courses which blend with the natural surroundings.
            </p>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              {[
                { label: "Nama Club", value: "Palm Springs Karawang" },
                { label: "Alamat", value: "Jl. Tol Jakarta - Cikampek No.km 47, Puseurjaya, Telukjambe Timur, Karawang, Jawa Barat 41361" },
                { label: "Course", value: "Private: 0, Public: 18" },
                { label: "Nama Course", value: "OUT, IN" },
                { label: "Nomor Telepon", value: "62267 644 742" },
                { label: "Desain Course", value: "Mark Rathert" },
                { label: "Rumput Course", value: "-" },
                { label: "Rumput Green", value: "-" },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start border-b border-gray-50 pb-3 last:border-0">
                  <span className="w-32 flex-shrink-0 font-bold text-gray-900 text-sm uppercase tracking-wider">{item.label}</span>
                  <span className="text-gray-600 text-sm md:text-base">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ClubSummary;
