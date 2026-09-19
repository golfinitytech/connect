import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Truck, ChefHat, AlertCircle, Users } from 'lucide-react';
import api from '../services/api';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let locationId = 'karawang';
    if (window.location.pathname.includes('/userpadanggolfsulaiman')) locationId = 'sulaiman';
    else if (window.location.pathname.includes('/userjatinangorgolf')) locationId = 'jatinangor';
    else if (window.location.pathname.includes('/userpalmspringkarawang')) locationId = 'karawang';
    else locationId = localStorage.getItem('adminLocationId') || 'karawang';

    const caddieCode = localStorage.getItem('caddieCode') || '001';

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders?locationId=${locationId}`);
        // Calculate queue (orders that are pending or preparing from ALL caddies)
        const activeQueue = res.data.filter((o: any) => o.status === 'PENDING' || o.status === 'PREPARING');
        setQueueCount(activeQueue.length);

        // Filter by caddieCode
        const myOrders = res.data.filter((o: any) => o.caddieCode === caddieCode);
        // Sort by newest first
        myOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(myOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Menunggu Konfirmasi', color: 'text-orange-500', bg: 'bg-orange-100', icon: <Clock size={20} className="text-orange-500" />, step: 1 };
      case 'PREPARING':
        return { label: 'Sedang Disiapkan', color: 'text-blue-500', bg: 'bg-blue-100', icon: <ChefHat size={20} className="text-blue-500" />, step: 2 };
      case 'ON_THE_WAY':
        return { label: 'Sedang Dikirim', color: 'text-indigo-500', bg: 'bg-indigo-100', icon: <Truck size={20} className="text-indigo-500" />, step: 3 };
      case 'DELIVERED':
        return { label: 'Sudah Sampai', color: 'text-emerald-500', bg: 'bg-emerald-100', icon: <CheckCircle size={20} className="text-emerald-500" />, step: 4 };
      case 'CANCELLED':
        return { label: 'Dibatalkan', color: 'text-red-500', bg: 'bg-red-100', icon: <AlertCircle size={20} className="text-red-500" />, step: 0 };
      default:
        return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100', icon: <Clock size={20} />, step: 0 };
    }
  };

  const stepsInfo = [
    { num: 1, label: 'Diterima' },
    { num: 2, label: 'Disiapkan' },
    { num: 3, label: 'Dikirim' },
    { num: 4, label: 'Sampai' },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white text-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800">Pantau Pesanan</h2>
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black tracking-wider">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg w-max">
              <Users size={16} />
              <span className="text-sm font-bold">Antrian Resto Saat Ini: {queueCount} Pesanan</span>
              <span className="text-sm border-l border-orange-300 pl-2 ml-1">Est. Tunggu: {queueCount * 5} Menit</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors self-start">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Memuat data pesanan...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Belum ada pesanan.</div>
          ) : (
            orders.map(order => {
              const statusInfo = getStatusDisplay(order.status);
              return (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-full ${statusInfo.bg}`}>
                        {statusInfo.icon}
                      </div>
                      <div>
                        <div className={`font-black text-lg ${statusInfo.color}`}>{statusInfo.label}</div>
                        <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800 text-lg">Rp {Number(order.totalPaid || 0).toLocaleString('id-ID')}</div>
                      <div className="text-xs text-slate-500">{order.items?.length || 0} item</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {order.status !== 'CANCELLED' && (
                    <div className="pt-8 pb-6 px-4">
                      <div className="relative">
                        {/* Moving Icon */}
                        <div 
                          className="absolute -top-10 transition-all duration-1000 ease-in-out z-20 flex flex-col items-center"
                          style={{ left: `${((statusInfo.step - 1) / 3) * 100}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className={`p-2 bg-white rounded-full shadow-lg border-2 ${statusInfo.step === 4 ? 'border-emerald-500' : 'border-blue-500 animate-bounce'}`}>
                            {statusInfo.step === 1 && <Clock size={18} className="text-blue-500" />}
                            {statusInfo.step === 2 && <ChefHat size={18} className="text-blue-500" />}
                            {statusInfo.step === 3 && <Truck size={18} className="text-blue-500" />}
                            {statusInfo.step === 4 && <CheckCircle size={18} className="text-emerald-500" />}
                          </div>
                        </div>

                        {/* Background Line */}
                        <div className="absolute top-1.5 left-0 w-full h-2 bg-slate-100 rounded-full"></div>
                        
                        {/* Active Line */}
                        <div 
                          className="absolute top-1.5 left-0 h-2 bg-blue-500 rounded-full transition-all duration-1000 ease-in-out"
                          style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                        >
                          {statusInfo.step > 0 && statusInfo.step < 4 && (
                            <div className="w-full h-full bg-white/30 animate-pulse rounded-full"></div>
                          )}
                        </div>
                        
                        {/* Dots and Labels */}
                        <div className="relative flex justify-between z-10">
                          {stepsInfo.map((step) => {
                            const isActive = step.num === statusInfo.step;
                            const isPast = step.num < statusInfo.step;
                            const isDone = statusInfo.step === 4;
                            return (
                              <div key={step.num} className="relative flex flex-col items-center">
                                <div className="relative">
                                  {isActive && !isDone && (
                                    <div className="absolute -inset-2 bg-blue-400 rounded-full animate-ping opacity-40"></div>
                                  )}
                                  <div className={`relative w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors duration-1000 ${isPast || isActive ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                                </div>
                                <span className={`absolute top-7 text-[11px] font-bold whitespace-nowrap transition-colors duration-1000 ${isActive ? 'text-blue-600' : isPast ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
                    <div className="font-bold text-slate-700 mb-2">Detail Pesanan:</div>
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span><span className="font-bold text-slate-800">{item.quantity}x</span> {item.menuItem?.name || 'Menu'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
