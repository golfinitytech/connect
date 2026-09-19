import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Clock, Smartphone, Trophy, ChevronRight, MessageCircle, X } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    activeRounds: 0,
    completedToday: 0,
    totalPlayers: 0,
    lastUpdate: ''
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<'control' | 'all' | 'marshal'>('control');
  const [chatDraft, setChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; ts: number; to: 'control' | 'all' | 'marshal'; fromRole: 'caddie' | 'admin' | 'marshal'; from: string; text: string }>>([]);

  const loadRealTimeStats = async () => {
    try {
      // @ts-ignore
      const { default: api } = await import('../services/api');
      const response = await api.get('/tournaments/active');
      const tournamentData = response.data || null;
      
      const dbGroups = tournamentData?.groups || [];
      
      let active = 0;
      let completed = 0;
      let totalPlayers = tournamentData?.players?.length || 0;

      const processedActivities = dbGroups.map((group: any, idx: number) => {
        let groupStatus = 'Pending';
        const groupPlayers = group.players || [];
        let hasScores = false;
        let allFinished = groupPlayers.length > 0;

        groupPlayers.forEach((p: any) => {
          const scores = p.scores || { IN: [], OUT: [] };
          const approvals = p.approvals || { IN: [], OUT: [] };
          const marshal = p.marshalEdited || { IN: [], OUT: [] };
          let holesPlayed = 0;
          
          (scores.IN || []).forEach((s: any, i: number) => {
            if ((approvals.IN?.[i] || marshal.IN?.[i]) && typeof s === 'number' && s > 0) holesPlayed++;
          });
          (scores.OUT || []).forEach((s: any, i: number) => {
            if ((approvals.OUT?.[i] || marshal.OUT?.[i]) && typeof s === 'number' && s > 0) holesPlayed++;
          });
          
          if (holesPlayed > 0) hasScores = true;
          if (holesPlayed < 18) allFinished = false;
        });

        if (hasScores) {
          if (allFinished) {
            groupStatus = 'Completed';
            completed++;
          } else {
            groupStatus = 'In Progress';
            active++;
          }
        }

        return {
          no: idx + 1,
          id: group.code || `RND-LIVE-${idx}`,
          start: tournamentData.info?.teeTime || tournamentData.teeTime || '07:00',
          group: `Group ${idx + 1}`,
          players: groupPlayers.map((p: any) => p.name).join(', '),
          caddie: group.caddie?.number || '-',
          status: groupStatus
        };
      });

      setActivities(processedActivities.slice(0, 5)); // Show top 5
      setStats({
        activeRounds: active,
        completedToday: completed,
        totalPlayers: totalPlayers,
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Failed to load real time stats from API:', error);
      setActivities([]);
      setStats(s => ({ ...s, activeRounds: 0, completedToday: 0, totalPlayers: 0, lastUpdate: new Date().toLocaleTimeString() }));
    }
  };

  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    const loadDeviceCount = () => {
      const saved = localStorage.getItem('golf_devices_gps');
      if (saved) {
        setDeviceCount(Object.keys(JSON.parse(saved)).length);
      }
    };
    loadDeviceCount();
    loadRealTimeStats();
    
    // Auto refresh stats every 10 seconds
    const interval = setInterval(loadRealTimeStats, 10000);

    const handleStorage = () => {
      loadDeviceCount();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const locationName = localStorage.getItem('adminLocation') || 'Palm Springs Karawang';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isChatOpen) return;
    const fetchChatMessages = async () => {
      try {
        // @ts-ignore
        const { default: api } = await import('../services/api');
        const res = await api.get('/tournaments/chat');
        setChatMessages(Array.isArray(res.data) ? res.data : []);
      } catch {
        setChatMessages([]);
      }
    };
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 2000);
    return () => clearInterval(interval);
  }, [isChatOpen]);

  const appendChatMessage = async (payload: { to: 'control' | 'all' | 'marshal'; text: string }) => {
    const text = payload.text.trim();
    if (!text) return;
    try {
      // @ts-ignore
      const { default: api } = await import('../services/api');
      await api.post('/tournaments/chat', {
        to: payload.to,
        fromRole: 'admin',
        from: 'PUSAT KONTROL',
        text
      });
    } catch {}
    setChatDraft('');
  };

  const visibleChatMessages = chatMessages
    .filter((m) => m?.to === chatRecipient)
    .slice()
    .sort((a, b) => (a?.ts || 0) - (b?.ts || 0));

  return (
    <div className="space-y-6">
      {/* Welcome Section with Golf Background - Compact Height */}
      <div className="relative h-44 rounded-[32px] overflow-hidden shadow-xl group border border-white/20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop")',
            backgroundPosition: 'center 30%'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                Selamat Datang, Admin
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-emerald-50 font-black uppercase tracking-[0.2em] text-[10px]">
                  Sistem Monitoring {locationName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Trophy size={80} className="text-white -rotate-12" />
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard 
          icon={<Clock className="text-blue-500" />} 
          label="Active Rounds" 
          value={stats.activeRounds} 
          subValue="Live on field"
          color="blue"
        />
        <StatCard 
          icon={<Smartphone className="text-emerald-500" />} 
          label="Connected Devices" 
          value={deviceCount} 
          subValue="Units Tracking"
          color="emerald"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-purple-500" />} 
          label="Completed Today" 
          value={stats.completedToday} 
          subValue="18 Holes finished"
          color="purple"
        />
        <StatCard 
          icon={<Users className="text-orange-500" />} 
          label="Total Players" 
          value={stats.totalPlayers} 
          subValue="Registered in tournament"
          color="orange"
        />
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Sync</span>
          <span className="text-xl font-black text-slate-700">{stats.lastUpdate}</span>
          <span className="text-[10px] text-blue-500 font-bold mt-1">● Connected to Tablets</span>
        </div>
      </div>

      {/* Tournament Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/admin/rounds/tournament-players"
          className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:border-orange-500 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-colors">
              <Users className="text-orange-600 group-hover:text-white" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">List Players</h3>
              <p className="text-sm text-slate-500 font-medium">Daftar seluruh pemain & database</p>
            </div>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" size={24} />
        </Link>

        <Link 
          to="/admin/rounds/create-tournament"
          className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:border-blue-500 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Trophy className="text-blue-600 group-hover:text-white" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Create Tournament</h3>
              <p className="text-sm text-slate-500 font-medium">Buat turnamen baru & grouping</p>
            </div>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
        </Link>

        <Link 
          to="/admin/rounds/tournament-players"
          className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:border-emerald-500 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
              <Smartphone className="text-emerald-600 group-hover:text-white" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Live Monitor</h3>
              <p className="text-sm text-slate-500 font-medium">Pantau progres pemain di lapangan</p>
            </div>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" size={24} />
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Your club is currently offering Golfinityscore services.</h2>
        <button className="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Club Status
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">Recent Tournament Activities</h2>
          <button 
            onClick={() => navigate('/admin/rounds')}
            className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
          >
            View All Rounds
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">No.</th>
                <th className="px-8 py-5">Round ID</th>
                <th className="px-8 py-5">Start Time</th>
                <th className="px-8 py-5">Group Name</th>
                <th className="px-8 py-5">Players</th>
                <th className="px-8 py-5">Caddie</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {activities.length > 0 ? activities.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-400">{row.no}</td>
                  <td className="px-8 py-5 font-medium text-slate-600">{row.id}</td>
                  <td className="px-8 py-5 text-slate-500 font-bold">{row.start}</td>
                  <td className="px-8 py-5 font-black text-slate-800 uppercase italic tracking-tight">{row.group}</td>
                  <td className="px-8 py-5 text-slate-600 font-bold max-w-xs truncate">{row.players}</td>
                  <td className="px-8 py-5 text-slate-500">{row.caddie}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      row.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      row.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100 animate-pulse' :
                      'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-400 font-bold italic">
                    Belum ada aktivitas turnamen aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-[300] w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/20 flex items-center justify-center active:scale-95 transition-all"
        title="Pesan"
      >
        <MessageCircle size={24} />
      </button>

      {isChatOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-[26px] shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight text-slate-900">Pilih Penerima</h3>
                <div className="flex items-center gap-10 pt-2">
                  <button type="button" onClick={() => setChatRecipient('control')} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-sm ${chatRecipient === 'control' ? 'bg-black' : 'bg-black/80'}`} />
                    <span className="text-xl font-semibold text-slate-900">Pusat Kontrol</span>
                  </button>
                  <button type="button" onClick={() => setChatRecipient('all')} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-sm ${chatRecipient === 'all' ? 'bg-black' : 'bg-black/80'}`} />
                    <span className="text-xl font-semibold text-slate-900">Semua</span>
                  </button>
                  <button type="button" onClick={() => setChatRecipient('marshal')} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-sm ${chatRecipient === 'marshal' ? 'bg-black' : 'bg-black/80'}`} />
                    <span className="text-xl font-semibold text-slate-900">Marshall</span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                <X size={22} className="text-slate-700" />
              </button>
            </div>

            <div className="p-8">
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <div className="bg-sky-600 px-5 py-4 flex items-center justify-between">
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.2em]">CHAT PANEL</span>
                </div>
                <div className="bg-[#0b0f14] p-5">
                  <div className="h-[260px] overflow-y-auto space-y-3">
                    {visibleChatMessages.length ? (
                      visibleChatMessages.map((m) => {
                        const isOut = m.fromRole === 'admin';
                        return (
                          <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] font-semibold ${
                              isOut
                                ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/20'
                                : 'bg-white/10 text-white/90 border border-white/10'
                            }`}>
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">No messages</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        appendChatMessage({ to: chatRecipient, text: chatDraft });
                      }}
                      placeholder="Kirim pesan..."
                      className="flex-1 h-12 rounded-xl bg-[#0d1830] border border-white/10 text-white/90 px-4 text-[14px] font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => appendChatMessage({ to: chatRecipient, text: chatDraft })}
                      className="h-12 w-12 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all flex items-center justify-center"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-700">{value}</span>
        <span className="text-[10px] font-bold text-gray-400">{subValue}</span>
      </div>
    </div>
  </div>
);

export default Home;
