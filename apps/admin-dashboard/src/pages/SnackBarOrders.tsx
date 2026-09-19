import React, { useState, useEffect, useRef } from 'react';
import { Download, Bell, ChefHat, Truck, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const SnackBarOrders = () => {
  const currentAdminLocationId = localStorage.getItem('adminLocationId') || 'karawang';
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [orders, setOrders] = useState<any[]>([]);
  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);
  const previousOrdersLength = useRef(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders?locationId=${currentAdminLocationId}`);
        const fetchedOrders = res.data;
        
        // Detect new order if length increased
        if (previousOrdersLength.current > 0 && fetchedOrders.length > previousOrdersLength.current) {
          const latestOrder = fetchedOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          // Only alert if it's actually new (e.g. pending)
          if (latestOrder && latestOrder.status === 'PENDING') {
            setNewOrderAlert(latestOrder);
            // Play a notification sound (simulated by showing popup and clearing after 5s)
            setTimeout(() => setNewOrderAlert(null), 5000);
          }
        }
        
        previousOrdersLength.current = fetchedOrders.length;
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto-refresh every 5s for better real-time feel
    return () => clearInterval(interval);
  }, [currentAdminLocationId]);

  const processOrders = () => {
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
        return orderDate >= startDate && orderDate <= endDate;
      })
      .map((order, index) => {
        const menuStr = (order.items || []).map((item: any) => `${item.menuItem?.name || 'Item'} x ${item.quantity}`);
        return {
          id: order.id,
          no: index + 1,
          caddie: order.caddieCode || 'Unknown',
          snackBar: 'FnB',
          hole: order.holeNumber || '-',
          menu: menuStr.length > 0 ? menuStr : ['Custom Item'],
          amount: Number(order.totalPaid || 0),
          time: new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' '),
          status: order.status
        };
      });
  };

  const data = processOrders();

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Refresh local data
      const res = await api.get(`/orders?locationId=${currentAdminLocationId}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Gagal mengupdate status pesanan.');
    }
  };

  const formatCurrency = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-sm relative">
      {/* New Order Alert Popup */}
      {newOrderAlert && (
        <div className="fixed top-20 right-8 z-[200] bg-orange-500 text-white p-6 rounded-2xl shadow-2xl shadow-orange-500/40 animate-in slide-in-from-right-8 duration-500 flex items-start gap-4 max-w-md border-2 border-orange-400">
          <div className="bg-white/20 p-3 rounded-full animate-bounce">
            <Bell size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-lg mb-1">PESANAN BARU MASUK!</h3>
            <p className="text-orange-50 text-sm mb-3">
              Caddie <span className="font-bold text-white bg-orange-600 px-2 py-0.5 rounded">{newOrderAlert.caddieCode}</span> baru saja memesan makanan.
            </p>
            <div className="bg-orange-600/50 p-3 rounded-lg text-xs space-y-1">
              {newOrderAlert.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{item.quantity}x {item.menuItem?.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        <h2 className="text-xl text-slate-700 font-normal">Snack Bar Order History</h2>
      </div>

      <div className="bg-[#f5f5f5] p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-200 px-4 py-2 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-slate-400 font-bold">~</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-200 px-4 py-2 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <select className="border border-slate-200 px-4 py-2 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option>- Select Caddie -</option>
            <option value="410">410</option>
            <option value="139">139</option>
          </select>
          <select className="border border-slate-200 px-4 py-2 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option>- Select Snack Bar -</option>
            <option value="FnB">FnB</option>
          </select>
          <button className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-colors">
            Search
          </button>
          <button className="bg-slate-700 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:bg-slate-600 transition-colors flex items-center gap-2">
            <Download size={16} />
            Download Spreadsheet
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 overflow-x-auto rounded-xl shadow-sm">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-[#4CAF50] text-white">
              <th className="py-4 px-4 font-bold tracking-wide rounded-tl-xl">No</th>
              <th className="py-4 px-4 font-bold tracking-wide">Caddie</th>
              <th className="py-4 px-4 font-bold tracking-wide">Location</th>
              <th className="py-4 px-4 font-bold tracking-wide">Snack Bar</th>
              <th className="py-4 px-4 font-bold tracking-wide text-left">Order Menu</th>
              <th className="py-4 px-4 font-bold tracking-wide">Amount</th>
              <th className="py-4 px-4 font-bold tracking-wide">Time of Order</th>
              <th className="py-4 px-4 font-bold tracking-wide">Status</th>
              <th className="py-4 px-4 font-bold tracking-wide rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className={`transition-colors ${row.status === 'PENDING' ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-slate-50'}`}>
                <td className="py-5 px-4 align-middle font-medium">{row.no}</td>
                <td className="py-5 px-4 align-middle">
                  <div className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                    {row.caddie}
                  </div>
                </td>
                <td className="py-5 px-4 align-middle">
                  <div className="inline-block bg-slate-800 text-white px-3 py-1 rounded-full font-bold text-xs">
                    Hole {row.hole}
                  </div>
                </td>
                <td className="py-5 px-4 align-middle">{row.snackBar}</td>
                <td className="py-5 px-4 text-left align-middle">
                  <div className="flex flex-col gap-1.5">
                    {row.menu.map((m, i) => {
                      const [name, qty] = m.split(' x ');
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{qty}x</span>
                          <span className="text-slate-600">{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="py-5 px-4 align-middle font-bold text-slate-800">Rp {formatCurrency(row.amount)}</td>
                <td className="py-5 px-4 align-middle text-slate-500">
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock size={14} />
                    {row.time}
                  </div>
                </td>
                <td className="py-5 px-4 align-middle">
                  {row.status === 'PENDING' && (
                    <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full font-bold text-xs animate-pulse">
                      <Clock size={14} /> Menunggu
                    </div>
                  )}
                  {row.status === 'PREPARING' && (
                    <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full font-bold text-xs">
                      <ChefHat size={14} /> Disiapkan
                    </div>
                  )}
                  {row.status === 'ON_THE_WAY' && (
                    <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full font-bold text-xs">
                      <Truck size={14} /> Dikirim
                    </div>
                  )}
                  {row.status === 'DELIVERED' && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full font-bold text-xs">
                      <CheckCircle size={14} /> Selesai
                    </div>
                  )}
                  {row.status === 'CANCELLED' && (
                    <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-bold text-xs">
                      Batal
                    </div>
                  )}
                </td>
                <td className="py-5 px-4 align-middle">
                  <div className="flex flex-col gap-2">
                    {row.status === 'PENDING' && (
                      <button onClick={() => handleUpdateStatus(row.id, 'PREPARING')} className="bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95">Terima Pesanan</button>
                    )}
                    {row.status === 'PREPARING' && (
                      <button onClick={() => handleUpdateStatus(row.id, 'ON_THE_WAY')} className="bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95">Kirim Pesanan</button>
                    )}
                    {row.status === 'ON_THE_WAY' && (
                      <button onClick={() => handleUpdateStatus(row.id, 'DELIVERED')} className="bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-indigo-500/30 hover:bg-indigo-600 transition-all active:scale-95">Selesaikan</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-slate-400 text-center text-lg">Belum ada pesanan masuk.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {data.length > 0 && (
          <div className="p-4 flex items-center justify-end text-sm text-slate-500 gap-2">
            <button className="hover:text-slate-700">First</button>
            <button className="hover:text-slate-700">Previous</button>
            <button className="bg-slate-400 text-white px-2 py-0.5 rounded">1</button>
            <button className="hover:text-slate-700">Next</button>
            <button className="hover:text-slate-700">Last</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnackBarOrders;