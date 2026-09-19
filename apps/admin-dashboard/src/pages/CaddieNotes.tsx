import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Camera, Edit3, X } from 'lucide-react';

interface PlayerNote {
  id: number;
  name: string;
  nopol: string;
  phone: string;
  memo: string;
}

const CaddieNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<PlayerNote[]>([
    { id: 1, name: '-', nopol: '0000', phone: '', memo: '' },
    { id: 2, name: '-', nopol: '0000', phone: '', memo: '' },
    { id: 3, name: '-', nopol: '0000', phone: '', memo: '' },
    { id: 4, name: '-', nopol: '0000', phone: '', memo: '' },
  ]);

  const handleUpdateNote = (id: number, field: keyof PlayerNote, value: string) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, [field]: value } : note));
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5e7eb] text-gray-800 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white px-8 py-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-gray-400">Catatan Caddie</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('../caddie-mode', { state: { view: 'dashboard' } })}
            className="border-2 border-slate-600 hover:bg-slate-800 px-8 py-2 rounded-lg text-sm font-bold transition-all"
          >
            Batal
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 px-10 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
            Simpan
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
        {/* Player Cards Grid */}
        <div className="grid grid-cols-4 gap-4 flex-1">
          {notes.map((note) => (
            <div key={note.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 flex flex-col gap-6 border border-white/40 shadow-sm">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-700 border-b border-slate-200 pb-2">{note.name}</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                    <span className="text-sm font-bold text-slate-400 w-12">Nopol</span>
                    <input 
                      type="text" 
                      value={note.nopol}
                      onChange={(e) => handleUpdateNote(note.id, 'nopol', e.target.value)}
                      className="bg-transparent outline-none flex-1 font-bold text-slate-600 placeholder:text-slate-300"
                    />
                    <X size={14} className="text-slate-300" />
                  </div>
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                    <span className="text-sm font-bold text-slate-400 w-12">Tlp.</span>
                    <input 
                      type="text" 
                      value={note.phone}
                      onChange={(e) => handleUpdateNote(note.id, 'phone', e.target.value)}
                      className="bg-transparent outline-none flex-1 font-bold text-slate-600 placeholder:text-slate-300"
                    />
                    <X size={14} className="text-slate-300" />
                  </div>
                </div>

                <textarea 
                  placeholder="Masukkan memo pribadi"
                  value={note.memo}
                  onChange={(e) => handleUpdateNote(note.id, 'memo', e.target.value)}
                  className="w-full bg-slate-50/50 rounded-lg p-3 text-sm font-medium text-slate-600 placeholder:text-slate-300 outline-none h-24 resize-none border border-slate-100"
                />
              </div>

              {/* Signature Area */}
              <div className="mt-auto border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[160px] group hover:border-blue-300 transition-colors">
                <button className="absolute top-2 right-2 p-1 text-slate-300 hover:text-blue-500">
                  <RotateCcw size={16} />
                </button>
                <span className="text-4xl font-light text-slate-300 mb-2">Sign</span>
                <p className="text-[10px] text-center text-slate-400 leading-tight">
                  Persetujuan Pemeriksaan Club<br />dan Pengumpulan Informasi
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Legal Text */}
        <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 relative">
          <h3 className="text-xs font-black text-slate-800 uppercase mb-3 tracking-wider">
            Persetujuan Pemeriksaan Club dan Pengumpulan Informasi
          </h3>
          <p className="text-[11px] leading-relaxed text-slate-600 font-medium max-w-[90%]">
            PT GOLFIN SINERGI INDONESIA Menerima Informasi mengenai ronde seperti nama pemain dan nomor telp dari Golf course untuk menyediakan skor managemen dan mencetak skor untuk pemain. Untuk tamu yang ingin menggunakan layanan ini, PT GOLFIN SINERGI INDONESIA mengumpulkan nomor telp, data skor, dan informasi video Data yang dikumpulkan akan tersimpan selama 90 hari dan akan dihapus, dan hanya akan digunakan untuk layanan lanjutan dari golf course dan PT GOLFIN SINERGI INDONESIA. Tetapi untuk anggota PT GOLFIN SINERGI INDONESIA, informasi terkait tim atau grup yang termasuk anggota, akan di simpan untuk kebutuhan anggota tersebut Anda memiliki hak untuk menolak ketentuan ini, tetapi akan membatasi anda untuk skor managemen dan print skor digital Dengan menandatangani ini anda setuju dengan pengumpulan
          </p>

          {/* Floating Action Buttons */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-4">
            <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/30 hover:scale-110 transition-transform">
              <div className="flex flex-col items-center">
                <Camera size={20} />
                <span className="text-[8px] font-bold mt-1 uppercase">Clubs</span>
              </div>
            </button>
            <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-800/30 hover:scale-110 transition-transform">
              <div className="flex flex-col items-center">
                <Edit3 size={20} />
                <span className="text-[8px] font-bold mt-1 uppercase">Memo</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaddieNotes;
