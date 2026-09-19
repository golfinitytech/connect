import React, { useState, useEffect } from 'react';
import { Download, Trophy, Medal, Star, TrendingUp, Medal as MedalIcon } from 'lucide-react';
import api from '../services/api';

const CaddieOrders = () => {
  const currentAdminLocationId = localStorage.getItem('adminLocationId') || 'karawang';
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders?locationId=${currentAdminLocationId}`);
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [currentAdminLocationId]);

  // Aggregate data by caddieCode
  const aggregateData = () => {
    const map = new Map<string, any>();
    
    orders.forEach(order => {
      // Filter by date if needed
      const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
      if (orderDate >= startDate && orderDate <= endDate) {
        const code = order.caddieCode || 'Unknown';
        if (!map.has(code)) {
          map.set(code, {
            locationId: currentAdminLocationId,
            caddieCode: code,
            nickname: order.user?.fullName || `Caddie ${code}`,
            barName: 'FnB',
            orderCount: 0,
            beforeTax: 0,
            vat: 0,
            amount: 0
          });
        }
        
        const entry = map.get(code);
        entry.orderCount += 1;
        entry.beforeTax += Number(order.subtotal || 0);
        entry.vat += Number(order.serviceFee || 0);
        entry.amount += Number(order.totalPaid || 0);
      }
    });

    const data = Array.from(map.values()).sort((a, b) => b.amount - a.amount);
    return data.map((d, index) => ({ ...d, orderRank: index + 1 }));
  };

  const data = aggregateData();
  const totalAmount = data.reduce((acc, curr) => acc + curr.amount, 0);
  const totalItems = data.reduce((acc, curr) => acc + curr.orderCount, 0);

  const formatCurrency = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const top1 = data.find(d => d.orderRank === 1);
  const top2 = data.find(d => d.orderRank === 2);
  const top3 = data.find(d => d.orderRank === 3);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto text-sm">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
        <h2 className="text-2xl text-slate-800 font-black tracking-tight">Snack Bar Order Ranking</h2>
      </div>

      <div className="bg-white p-5 rounded-2xl flex flex-wrap items-center justify-between shadow-sm border border-slate-100 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
          <span className="text-slate-400 font-black">~</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
          <button className="bg-emerald-600 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:translate-y-0">
            Search
          </button>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-slate-800/20 hover:bg-slate-700 hover:-translate-y-0.5 transition-all active:translate-y-0">
          <Download size={18} />
          Download Spreadsheet
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={20} /> Top Caddies Performance
        </h3>
        
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-2 mt-8">
          {/* 2nd Place */}
          <div className="bg-slate-50 rounded-xl p-4 w-full md:w-56 text-center relative border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-10 h-10 flex items-center justify-center rounded-full border-4 border-white shadow-sm">
              <MedalIcon size={16} />
            </div>
            <div className="mt-4 mb-1 text-slate-500 font-bold text-[10px] tracking-widest uppercase">2nd Place</div>
            <div className="text-slate-800 text-2xl font-black mb-3">{top2?.caddieCode || '-'}</div>
            <div className="bg-white rounded-lg p-2 shadow-inner border border-slate-100">
              <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Total Amount</div>
              <div className="text-emerald-600 font-bold text-sm">Rp {top2 ? formatCurrency(top2.amount) : '0'}</div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-amber-50/50 rounded-xl p-5 w-full md:w-64 text-center relative border border-amber-200 shadow-md md:-translate-y-4 hover:-translate-y-5 transition-transform z-10">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-white w-12 h-12 flex items-center justify-center rounded-full border-4 border-white shadow-sm">
              <Trophy size={20} />
            </div>
            <div className="mt-4 mb-1 text-amber-600 font-bold text-[10px] tracking-widest uppercase flex items-center justify-center gap-1">
              <Star size={10} className="fill-amber-500" /> Champion <Star size={10} className="fill-amber-500" />
            </div>
            <div className="text-slate-800 text-3xl font-black mb-4">{top1?.caddieCode || '-'}</div>
            <div className="flex justify-center gap-2">
              <div className="flex-1 bg-white rounded-lg p-2 shadow-inner border border-slate-100">
                <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Orders</div>
                <div className="text-slate-800 font-bold text-sm">{top1?.orderCount || '0'}</div>
              </div>
              <div className="flex-[1.5] bg-white rounded-lg p-2 shadow-inner border border-slate-100">
                <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Total Amount</div>
                <div className="text-emerald-600 font-bold text-sm">Rp {top1 ? formatCurrency(top1.amount) : '0'}</div>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-orange-50/30 rounded-xl p-4 w-full md:w-56 text-center relative border border-orange-100 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-300 text-white w-10 h-10 flex items-center justify-center rounded-full border-4 border-white shadow-sm">
              <MedalIcon size={16} />
            </div>
            <div className="mt-4 mb-1 text-slate-500 font-bold text-[10px] tracking-widest uppercase">3rd Place</div>
            <div className="text-slate-800 text-2xl font-black mb-3">{top3?.caddieCode || '-'}</div>
            <div className="bg-white rounded-lg p-2 shadow-inner border border-slate-100">
              <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Total Amount</div>
              <div className="text-emerald-600 font-bold text-sm">Rp {top3 ? formatCurrency(top3.amount) : '0'}</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6 bg-slate-800 p-4 rounded-2xl shadow-lg shadow-slate-800/20 text-white">
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-1">Total Amount</span>
            <span className="text-emerald-400 font-black text-xl">Rp {formatCurrency(totalAmount)}</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-1">Total Items</span>
            <span className="text-white font-black text-xl">{totalItems} <span className="text-sm font-normal">items</span></span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#4CAF50] text-white">
                <th className="py-4 px-4 font-bold tracking-wide rounded-tl-xl">Rank</th>
                <th className="py-4 px-4 font-bold tracking-wide">Caddie Code</th>
                <th className="py-4 px-4 font-bold tracking-wide">Caddie Name</th>
                <th className="py-4 px-4 font-bold tracking-wide">Item Name</th>
                <th className="py-4 px-4 font-bold tracking-wide">No. of Orders</th>
                <th className="py-4 px-4 font-bold tracking-wide">Before Tax</th>
                <th className="py-4 px-4 font-bold tracking-wide">VAT</th>
                <th className="py-4 px-4 font-bold tracking-wide rounded-tr-xl">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 divide-y divide-slate-100">
              {data.map((row) => (
                <React.Fragment key={row.caddieCode}>
                  {/* Main Caddie Row */}
                  <tr className="bg-slate-50 hover:bg-slate-100 transition-colors">
                    <td className="py-4 px-4 font-black text-lg text-slate-800">
                      {row.orderRank === 1 && <span className="text-amber-500">1</span>}
                      {row.orderRank === 2 && <span className="text-slate-400">2</span>}
                      {row.orderRank === 3 && <span className="text-orange-400">3</span>}
                      {row.orderRank > 3 && row.orderRank}
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-block bg-white text-slate-800 border border-slate-200 px-3 py-1 rounded-full font-black shadow-sm">
                        {row.caddieCode}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold">{row.nickname}</td>
                    <td className="py-4 px-4 text-slate-400">-</td>
                    <td className="py-4 px-4 font-bold text-blue-600">{row.orderCount}</td>
                    <td className="py-4 px-4">Rp {formatCurrency(row.beforeTax)}</td>
                    <td className="py-4 px-4 text-slate-400">Rp {formatCurrency(row.vat)}</td>
                    <td className="py-4 px-4 font-black text-emerald-600">Rp {formatCurrency(row.amount)}</td>
                  </tr>
                  {/* FnB Sub Row */}
                  <tr className="bg-white hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="py-3 px-4 border-r border-slate-100 bg-slate-50/30" colSpan={3}></td>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.barName}</td>
                    <td className="py-3 px-4 text-blue-600">{row.orderCount}</td>
                    <td className="py-3 px-4 text-slate-500">Rp {formatCurrency(row.beforeTax)}</td>
                    <td className="py-3 px-4 text-slate-400">Rp {formatCurrency(row.vat)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">Rp {formatCurrency(row.amount)}</td>
                  </tr>
                </React.Fragment>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-slate-400 text-center text-lg">Belum ada data ranking untuk lokasi/tanggal ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaddieOrders;
