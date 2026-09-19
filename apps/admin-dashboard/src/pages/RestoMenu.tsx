import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Plus, RefreshCw, X, FileText } from 'lucide-react';
import api from '../services/api';
import OrderTrackingModal from '../components/OrderTrackingModal';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

const menuItems: MenuItem[] = [
  { id: '1', name: 'Club Sandwich', price: 78512, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop' },
  { id: '2', name: 'Hot Dog', price: 36364, image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=800&auto=format&fit=crop' },
  { id: '3', name: 'French Fries', price: 61983, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop' },
  { id: '4', name: 'Mie Goreng', price: 73554, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop' },
  { id: '5', name: 'Nasi Goreng Special', price: 74380, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop' },
  { id: '6', name: 'Kwetiaw Goreng', price: 73554, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop' },
];

const RestoMenu = () => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const handleUpdateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const activeItem = menuItems[activeIndex];
  const total = menuItems.reduce((sum, item) => sum + (item.price * quantities[item.id]), 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handlePesan = async () => {
    if (total === 0) {
      alert('Pilih setidaknya satu menu untuk dipesan.');
      return;
    }

    try {
      setIsSubmitting(true);
      const items = menuItems
        .filter(item => quantities[item.id] > 0)
        .map(item => ({
          menuItemId: item.id, // Using the static id, assuming backend handles this or we need to ensure menuItems exist
          quantity: quantities[item.id],
          name: item.name,
          price: item.price
        }));

      // Extract location from URL or fallback to localStorage
      let locationId = 'karawang';
      if (window.location.pathname.includes('/userpadanggolfsulaiman')) locationId = 'sulaiman';
      else if (window.location.pathname.includes('/userjatinangorgolf')) locationId = 'jatinangor';
      else if (window.location.pathname.includes('/userpalmspringkarawang')) locationId = 'karawang';
      else locationId = localStorage.getItem('adminLocationId') || 'karawang';

      const caddieCode = localStorage.getItem('caddieCode') || '001'; 
      const userId = localStorage.getItem('userId') || 'dummy-user-id';
      
      // Determine nearest hole based on current score input if any
      const scoreDataStr = localStorage.getItem('golf_players_scores');
      let nearestHole = 1;
      if (scoreDataStr) {
        try {
          const scoreData = JSON.parse(scoreDataStr);
          // Find highest hole number with a score
          for (let hole = 18; hole >= 1; hole--) {
            const hasScore = scoreData.some((p: any) => p.scores[hole] && p.scores[hole].score > 0);
            if (hasScore) {
              nearestHole = hole;
              break;
            }
          }
        } catch (e) {}
      }

      // We need to send this to our backend.
      // Since menuItems in DB might not match our hardcoded list, we can just use the name if needed, but for now we'll send it and backend will process it
      await api.post('/orders', {
        userId,
        locationId,
        caddieCode,
        holeNumber: nearestHole,
        items: items.map(i => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity
        }))
      });

      setIsSuccessModalOpen(true);
      
      // Reset quantities
      setQuantities(menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Gagal mengirim pesanan. Pastikan item menu tersedia di database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5e7eb] text-gray-800 overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#1a1a1a] text-white px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-400">Menu Resto</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTrackingModalOpen(true)}
            className="flex items-center gap-2 border-2 border-emerald-600 text-emerald-400 hover:bg-emerald-900/30 px-6 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <FileText size={18} />
            PANTAU PESANAN
          </button>
          <button className="border-2 border-slate-600 hover:bg-slate-800 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
            PERBARUI
          </button>
          <button 
            onClick={() => navigate('../caddie-mode', { state: { view: 'dashboard' } })}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            TUTUP
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-200/50 border-b flex px-6 shrink-0">
        <button className="px-10 py-4 border-b-4 border-blue-600 text-slate-700 font-bold text-lg">FnB</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Image Carousel */}
        <div className="flex-[1.2] p-8 flex flex-col relative bg-slate-100/50">
          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl group">
            <img 
              src={activeItem.image} 
              alt={activeItem.name} 
              className="w-full h-full object-cover"
            />
            {/* Overlay Title & Price */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] flex justify-between items-start pointer-events-none">
               <div className="bg-red-600/90 backdrop-blur-sm text-white px-6 py-2 rounded-lg shadow-xl flex items-center gap-4">
                  <span className="font-black text-xl tracking-wider">{activeItem.name.toUpperCase()}</span>
                  <span className="text-xl font-medium border-l border-white/30 pl-4">Rp {activeItem.price.toLocaleString('id-ID')}</span>
               </div>
            </div>
            
            {/* Carousel Navigation */}
            <button 
              onClick={() => setActiveIndex(prev => (prev - 1 + menuItems.length) % menuItems.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all backdrop-blur-md"
            >
              <ChevronLeft size={40} strokeWidth={1} />
            </button>
            <button 
              onClick={() => setActiveIndex(prev => (prev + 1) % menuItems.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all backdrop-blur-md"
            >
              <ChevronRight size={40} strokeWidth={1} />
            </button>

            {/* Bottom Caption */}
            <div className="absolute bottom-8 left-0 w-full text-center">
              <span className="bg-black/30 backdrop-blur-md text-white px-10 py-2 rounded-full text-2xl font-bold tracking-wide">
                {activeItem.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Order Form */}
        <div className="flex-1 flex flex-col bg-white border-l border-slate-200">
          <div className="p-8 border-b bg-slate-50/50">
            <h2 className="text-4xl font-light text-center text-slate-800 tracking-tight">Formulir pesanan</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-[1fr,auto,120px] gap-6 px-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Menu</span>
              <span className="text-center">Jumlah</span>
              <span className="text-right">Harga</span>
            </div>
            
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`grid grid-cols-[1fr,auto,120px] gap-6 items-center p-4 rounded-2xl transition-all cursor-pointer ${activeIndex === menuItems.indexOf(item) ? 'bg-blue-50/80 shadow-sm ring-1 ring-blue-100' : 'hover:bg-slate-50'}`}
                  onClick={() => setActiveIndex(menuItems.indexOf(item))}
                >
                  <span className={`font-bold text-xl truncate ${activeIndex === menuItems.indexOf(item) ? 'text-blue-900' : 'text-slate-700'}`}>{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-2xl text-slate-500">{quantities[item.id]}</span>
                    <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpdateQty(item.id, -1); }}
                        className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Minus size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpdateQty(item.id, 1); }}
                        className="p-2 hover:bg-slate-100 text-slate-600 border-l-2 border-slate-200 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  <span className="text-right font-black text-xl text-slate-800">
                    {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Total */}
          <div className="p-10 border-t bg-slate-50/80">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-slate-500 font-bold text-xl uppercase tracking-widest">Total</span>
              </div>
              <span className="text-4xl font-black text-slate-900">
                {total.toLocaleString('id-ID')} Rp
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => setQuantities(menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}))}
                className="py-5 border-2 border-slate-300 text-slate-600 font-black text-xl rounded-2xl hover:bg-white hover:border-slate-400 transition-all active:scale-[0.98]">
                BATAL
              </button>
              <button 
                onClick={handlePesan}
                disabled={isSubmitting || total === 0}
                className="py-5 bg-blue-600 text-white font-black text-xl rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'MEMPROSES...' : 'PESAN'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSuccessModalOpen(false)} />
          <div className="relative bg-white text-slate-800 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <h3 className="text-2xl font-black text-slate-800">Terkirim</h3>
              <p className="text-lg text-slate-600 font-medium">Pesanan berhasil dikirim!</p>
              <button 
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsTrackingModalOpen(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                LIHAT PESANAN SAYA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      <OrderTrackingModal 
        isOpen={isTrackingModalOpen} 
        onClose={() => setIsTrackingModalOpen(false)} 
      />
    </div>
  );
};

export default RestoMenu;
