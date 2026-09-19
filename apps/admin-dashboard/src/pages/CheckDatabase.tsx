import React, { useState, useEffect } from 'react';
import { Database, Server, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const CheckDatabase = () => {
  const [status, setStatus] = useState<{
    api: 'checking' | 'ok' | 'error';
    database: 'checking' | 'ok' | 'error';
    message?: string;
    timestamp?: string;
  }>({
    api: 'checking',
    database: 'checking'
  });

  const checkStatus = async () => {
    setStatus({ api: 'checking', database: 'checking' });
    try {
      // Use the new endpoint we just created
      const response = await api.get('/system-status');
      setStatus({
        api: response.data.api,
        database: response.data.database,
        message: response.data.message,
        timestamp: response.data.timestamp
      });
    } catch (err: any) {
      console.error('Status check failed:', err);
      // If we can't even reach the API, then API is error, and DB is unknown (error)
      setStatus({
        api: 'error',
        database: 'error',
        message: err.message || 'Gagal menghubungi server backend (Network Error)',
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
            <Database className="text-[#0e7c5b]" size={32} />
            Cek Status Sistem
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Halaman ini digunakan untuk memonitor apakah Server Backend (API) dan Database terhubung dan berfungsi dengan baik.
          </p>
        </div>
        <button
          onClick={checkStatus}
          disabled={status.api === 'checking'}
          className="flex items-center gap-2 bg-[#0e7c5b] hover:bg-[#0b6147] text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={status.api === 'checking' ? 'animate-spin' : ''} />
          Cek Ulang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Backend API Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <Server size={48} className={`mb-4 ${status.api === 'ok' ? 'text-emerald-500' : status.api === 'error' ? 'text-rose-500' : 'text-slate-400'}`} />
          <h2 className="text-xl font-bold text-slate-800 mb-1">Server Backend (API)</h2>
          
          {status.api === 'checking' && (
            <div className="text-slate-500 font-medium flex items-center gap-2 mt-2">
              <RefreshCw size={16} className="animate-spin" /> Sedang memeriksa...
            </div>
          )}
          
          {status.api === 'ok' && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-bold flex items-center gap-2 mt-2 border border-emerald-200">
              <CheckCircle2 size={18} /> Terhubung & Aktif
            </div>
          )}

          {status.api === 'error' && (
            <div className="bg-rose-50 text-rose-700 px-4 py-1.5 rounded-full font-bold flex items-center gap-2 mt-2 border border-rose-200">
              <XCircle size={18} /> Terputus (Offline)
            </div>
          )}
        </div>

        {/* Database Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <Database size={48} className={`mb-4 ${status.database === 'ok' ? 'text-emerald-500' : status.database === 'error' ? 'text-rose-500' : 'text-slate-400'}`} />
          <h2 className="text-xl font-bold text-slate-800 mb-1">Database System</h2>
          
          {status.database === 'checking' && (
            <div className="text-slate-500 font-medium flex items-center gap-2 mt-2">
              <RefreshCw size={16} className="animate-spin" /> Sedang memeriksa...
            </div>
          )}
          
          {status.database === 'ok' && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-bold flex items-center gap-2 mt-2 border border-emerald-200">
              <CheckCircle2 size={18} /> Terhubung & Aktif
            </div>
          )}

          {status.database === 'error' && (
            <div className="bg-rose-50 text-rose-700 px-4 py-1.5 rounded-full font-bold flex items-center gap-2 mt-2 border border-rose-200">
              <XCircle size={18} /> Error Koneksi
            </div>
          )}
        </div>
      </div>

      {/* Error Message Details */}
      {(status.api === 'error' || status.database === 'error') && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex gap-4">
          <XCircle className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-800 mb-1">Rincian Masalah:</h3>
            <p className="text-rose-600 text-sm">
              {status.message || 'Tidak ada detail error tambahan.'}
            </p>
            <p className="text-rose-500 text-xs mt-2 italic">
              Jika Database Error, ini bisa menjadi penyebab dari Prisma Error (seperti P2002) atau gagalnya penyimpanan skor.
              Pastikan server tidak mengalami bentrok port dan koneksi internet stabil.
            </p>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {status.api === 'ok' && status.database === 'ok' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex gap-4">
          <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-800 mb-1">Semua Sistem Normal</h3>
            <p className="text-emerald-600 text-sm">
              Koneksi antara dashboard, server backend (port 3002), dan database berfungsi dengan sangat baik. 
              Sistem siap digunakan untuk turnamen.
            </p>
            {status.timestamp && (
              <p className="text-emerald-500 text-xs mt-2 italic">
                Terakhir dicek: {new Date(status.timestamp).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckDatabase;
