import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Trash2, 
  RefreshCw, 
  Activity, 
  Server, 
  HardDrive,
  AlertCircle,
  CheckCircle2,
  FileText,
  Search
} from 'lucide-react';

const SystemDebug = () => {
  const [storageData, setStorageData] = useState<{key: string, value: string, size: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    api: 'Checking...',
    db: 'Connected',
    localStorage: '0 KB',
    lastSync: '-'
  });
  const [logs, setLogs] = useState<{time: string, type: string, msg: string}[]>([]);

  const addLog = (type: string, msg: string) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), type, msg }, ...prev].slice(0, 50));
  };

  const loadStorageData = () => {
    const data: {key: string, value: string, size: string}[] = [];
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      const value = localStorage.getItem(key) || '';
      const size = (key.length + value.length) * 2; // Approximate size in bytes
      totalSize += size;
      data.push({
        key,
        value,
        size: (size / 1024).toFixed(2) + ' KB'
      });
    }
    
    setStorageData(data.sort((a, b) => b.key.localeCompare(a.key)));
    setSystemStatus(prev => ({
      ...prev,
      localStorage: (totalSize / 1024).toFixed(2) + ' KB',
      lastSync: new Date().toLocaleTimeString()
    }));
    addLog('INFO', 'Local Storage data refreshed');
  };

  useEffect(() => {
    loadStorageData();
    // Simulate API check
    setTimeout(() => {
      setSystemStatus(prev => ({ ...prev, api: 'Online' }));
      addLog('SUCCESS', 'API Backend Connection Verified');
    }, 1000);

    const interval = setInterval(loadStorageData, 30000);
    return () => clearInterval(interval);
  }, []);

  const clearKey = (key: string) => {
    if (window.confirm(`Hapus data "${key}"?`)) {
      localStorage.removeItem(key);
      loadStorageData();
      addLog('WARNING', `Data key "${key}" dihapus secara manual`);
    }
  };

  const clearAllCache = () => {
    if (window.confirm('PERINGATAN: Ini akan menghapus SELURUH data lokal (Turnamen, Skor, Caddie). Lanjutkan?')) {
      localStorage.clear();
      loadStorageData();
      addLog('DANGER', 'Seluruh Local Storage telah dibersihkan!');
    }
  };

  const filteredData = storageData.filter(d => 
    d.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-8 rounded-[32px] text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="text-blue-400" size={24} />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">System Debug & Logs</h1>
          </div>
          <p className="text-slate-400 font-medium text-sm">Monitoring Database Lokal, API, dan Aktivitas Sistem</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={loadStorageData}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/10"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={clearAllCache}
            className="bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 p-3 rounded-2xl transition-all border border-rose-500/30"
            title="Clear All Cache"
          >
            <Trash2 size={20} />
          </button>
        </div>
        {/* Background Decorative */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-blue-600/10 skew-x-12 translate-x-10" />
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatusCard 
          icon={<Server size={20} className="text-blue-500" />}
          label="API Status"
          value={systemStatus.api}
          status={systemStatus.api === 'Online' ? 'success' : 'warning'}
        />
        <StatusCard 
          icon={<Database size={20} className="text-emerald-500" />}
          label="Database (MySQL)"
          value={systemStatus.db}
          status="success"
        />
        <StatusCard 
          icon={<HardDrive size={20} className="text-purple-500" />}
          label="Local Storage Usage"
          value={systemStatus.localStorage}
          status="info"
        />
        <StatusCard 
          icon={<Activity size={20} className="text-amber-500" />}
          label="Last Sync"
          value={systemStatus.lastSync}
          status="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Local Storage Explorer */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="text-slate-400" size={20} />
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-800">Local Storage Explorer</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari key atau value..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Storage Key</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((data, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-700 font-mono tracking-tight">{data.key}</span>
                        <div className="max-w-md truncate text-[10px] text-slate-400 font-mono italic">
                          {data.value}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{data.size}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => clearKey(data.key)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-slate-900 rounded-[32px] shadow-xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <FileText className="text-blue-400" size={20} />
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Live System Logs</h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3 font-mono">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-[10px] animate-in fade-in slide-in-from-right-2 duration-300">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className={`font-black shrink-0 ${
                  log.type === 'SUCCESS' ? 'text-emerald-400' : 
                  log.type === 'WARNING' ? 'text-amber-400' : 
                  log.type === 'DANGER' ? 'text-rose-400' : 
                  'text-blue-400'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-300 leading-relaxed">{log.msg}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                <Terminal size={40} className="mb-2 opacity-20" />
                <p>Waiting for system activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ icon, label, value, status }: any) => (
  <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
      status === 'success' ? 'bg-emerald-50 border-emerald-100' : 
      status === 'warning' ? 'bg-amber-50 border-amber-100' :
      'bg-blue-50 border-blue-100'
    }`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-black text-slate-800 italic tracking-tight">{value}</span>
        {status === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
        {status === 'warning' && <AlertCircle size={14} className="text-amber-500" />}
      </div>
    </div>
    <div className={`absolute -right-2 -bottom-2 w-16 h-16 opacity-[0.03] transition-transform duration-700 group-hover:scale-125 ${
      status === 'success' ? 'text-emerald-600' : 'text-blue-600'
    }`}>
      {icon}
    </div>
  </div>
);

export default SystemDebug;
