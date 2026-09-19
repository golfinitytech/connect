import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Map as MapIcon, 
  Search, 
  Users, 
  MessageSquare, 
  MoreHorizontal,
  ChevronDown,
  Plus,
  Flag,
  AlertCircle,
  Clock,
  Send,
  User,
  Monitor,
  Layout,
  ChevronLeft
} from 'lucide-react';

const CourseMonitoring = () => {
  const navigate = useNavigate();
  const [screenRatio, setScreenRatio] = useState(100);
  const [adminLocation, setAdminLocation] = useState(localStorage.getItem('adminLocation') || 'Global Admin');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCaddieSearchModal, setShowCaddieSearchModal] = useState(false);
  const [caddieSearchQuery, setCaddieSearchQuery] = useState('');
  const [caddieSearchResults, setCaddieSearchResults] = useState<any[]>([]);
  const [highlightedHole, setHighlightedHole] = useState<number | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, cart: '106', text: 'pa macet', time: '11:58 AM' },
    { id: 2, cart: '106', text: 'macet', time: '12:00 PM' },
    { id: 3, cart: '106', text: 'di hole', time: '12:00 PM' },
  ]);

  // Load real data from storage
  const [realOutHoles, setRealOutHoles] = useState<any[]>([]);
  const [realInHoles, setRealInHoles] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const savedScores = localStorage.getItem('golf_players_scores');
      
      const defaultOut = [
        { hole: 1, players: [{ id: '#96', pos: 70, color: 'red', dist: '281, 208', startTime: '11:30 AM', speed: 'normal' }] },
        { hole: 2, players: [] },
        { hole: 3, players: [] },
        { hole: 4, players: [] },
        { hole: 5, players: [] },
        { hole: 6, players: [{ id: '??', pos: 40, color: 'red', dist: '447, 441', startTime: '10:15 AM', speed: 'slow' }] },
        { hole: 7, players: [] },
        { hole: 8, players: [] },
        { hole: 9, players: [] },
      ];

      const defaultIn = [
        { hole: 10, players: [{ id: '#22', pos: 60, color: 'red', dist: '247, 118', startTime: '11:45 AM', speed: 'normal' }] },
        { hole: 11, players: [{ id: '#55', pos: 40, color: 'red', dist: '209, 201', startTime: '12:05 PM', speed: 'normal' }] },
        { hole: 12, players: [] },
        { hole: 13, players: [] },
        { hole: 14, players: [] },
        { hole: 15, players: [{ id: '#91', pos: 80, color: 'red', dist: '423, 422', startTime: '10:50 AM', speed: 'normal' }] },
        { hole: 16, players: [] },
        { hole: 17, players: [] },
        { hole: 18, players: [
          { id: '#115', pos: 30, color: 'yellow', dist: '223, 440', startTime: '11:10 AM', speed: 'normal' }, 
          { id: '#78', pos: 70, color: 'red', dist: '427', startTime: '11:15 AM', speed: 'slow' }
        ] },
      ];

      if (savedScores) {
        const players = JSON.parse(savedScores);
        const holesOut = Array.from({ length: 9 }, (_, i) => ({
          hole: i + 1,
          players: players.filter((p: any) => p.currentHole === i + 1).map((p: any) => ({
            id: p.cartNo || `#${p.caddieId || '??'}`,
            pos: Math.random() * 80 + 10,
            color: p.status === 'delayed' ? 'yellow' : 'red',
            dist: p.distanceToHole || '200',
            startTime: p.startTime || '12:00 PM',
            speed: p.status === 'delayed' ? 'slow' : 'normal'
          }))
        }));

        const holesIn = Array.from({ length: 9 }, (_, i) => ({
          hole: i + 10,
          players: players.filter((p: any) => p.currentHole === i + 10).map((p: any) => ({
            id: p.cartNo || `#${p.caddieId || '??'}`,
            pos: Math.random() * 80 + 10,
            color: p.status === 'delayed' ? 'yellow' : 'red',
            dist: p.distanceToHole || '200',
            startTime: p.startTime || '12:00 PM',
            speed: p.status === 'delayed' ? 'slow' : 'normal'
          }))
        }));

        setRealOutHoles(holesOut.map(h => ({
          ...h,
          players: h.players.length > 0 ? h.players : (defaultOut.find(d => d.hole === h.hole)?.players || [])
        })));
        setRealInHoles(holesIn.map(h => ({
          ...h,
          players: h.players.length > 0 ? h.players : (defaultIn.find(d => d.hole === h.hole)?.players || [])
        })));
      } else {
        setRealOutHoles(defaultOut);
        setRealInHoles(defaultIn);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleCaddieSearch = () => {
    if (!caddieSearchQuery.trim()) {
      setCaddieSearchResults([]);
      return;
    }

    const allActive = [...realOutHoles, ...realInHoles].reduce((acc: any[], h) => {
      const playersWithHole = h.players.map((p: any) => ({
        ...p,
        hole: h.hole
      }));
      return [...acc, ...playersWithHole];
    }, []);

    const results = allActive.filter(p => 
      p.id.toLowerCase().includes(caddieSearchQuery.toLowerCase())
    );

    setCaddieSearchResults(results);
  };

  const locateCaddie = (holeNum: number) => {
    setHighlightedHole(holeNum);
    setShowCaddieSearchModal(false);
    setCaddieSearchQuery('');
    setCaddieSearchResults([]);
    
    // Auto-scroll to the hole
    const holeElement = document.getElementById(`hole-container-${holeNum}`);
    if (holeElement) {
      holeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Remove highlight after a few seconds
    setTimeout(() => setHighlightedHole(null), 5000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#111111] text-white overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white flex items-center gap-1 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-800"></div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white italic">GOLFINITYSCORE</h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest -mt-1">{adminLocation}</p>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/10">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Screen ratio:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setScreenRatio(Math.max(50, screenRatio - 5))}
                className="text-white hover:bg-white/10 p-1 rounded w-5 h-5 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={screenRatio} 
                onChange={(e) => setScreenRatio(parseInt(e.target.value))}
                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-sm font-bold min-w-[40px] text-center">{screenRatio}%</span>
              <button 
                onClick={() => setScreenRatio(Math.min(150, screenRatio + 5))}
                className="text-white hover:bg-white/10 p-1 rounded w-5 h-5 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live : 8 C</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-rose-600/20 text-rose-400 px-3 py-1.5 rounded text-[10px] font-black border border-rose-600/30 uppercase tracking-tighter transition-all hover:bg-rose-600/30">View Course</button>
          <button className="bg-cyan-600 text-white px-3 py-1.5 rounded text-[10px] font-black flex items-center gap-1 uppercase tracking-tighter transition-all hover:bg-cyan-500">
            <MapIcon size={12} fill="currentColor" /> MAP
          </button>
          <div className="relative group">
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-[10px] font-black flex items-center gap-2 uppercase tracking-tighter">
              Name&Cart No. <ChevronDown size={12} />
            </button>
            <div className="absolute top-full left-0 w-40 mt-1 bg-blue-700 rounded shadow-2xl border border-white/10 hidden group-hover:block z-50 overflow-hidden">
              {['Name&Time', 'Name&Cart No.', 'Cart No.&Time', 'Time', 'Name', 'Cart No.'].map(opt => (
                <button key={opt} className="w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-blue-600 border-b border-white/5 last:border-0">{opt}</button>
              ))}
            </div>
          </div>
          <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-[10px] font-black flex items-center gap-2 uppercase tracking-tighter">
            Screen settings <ChevronDown size={12} />
          </button>
          <button 
            onClick={() => setShowCaddieSearchModal(true)}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-500 transition-colors"
          >
            Search Caddie
          </button>
          <button 
            onClick={() => setShowSearchModal(true)}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-500 transition-colors"
          >
            Search Customer
          </button>
          <button className="bg-emerald-600 text-white px-3 py-1.5 rounded text-[10px] font-black flex items-center gap-2 uppercase tracking-tighter">
            Select Group <ChevronDown size={12} />
          </button>
        </div>

        <div className="text-lg font-black tabular-nums text-white/90">12:19:01 PM</div>
      </div>

      {/* Sub Toolbar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-[#111111] border-b border-gray-800/50 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-500 uppercase mr-2 tracking-widest">Course Color</span>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-lg shadow-red-600/40 border border-white/20 transition-transform active:scale-95">
              <Flag size={14} fill="white" />
            </div>
            <span className="text-[9px] font-black text-white tracking-tighter">OUT</span>
          </button>
          <button className="flex flex-col items-center gap-1 group opacity-40 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center border border-white/10">
              <Flag size={14} fill="white" />
            </div>
            <span className="text-[9px] font-black text-gray-500 tracking-tighter">IN</span>
          </button>
        </div>

        <div className="h-10 w-px bg-gray-800 mx-2"></div>

        <button className="bg-gray-800 hover:bg-gray-700 w-12 h-12 rounded border border-white/10 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 shadow-lg">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Cart</span>
        </button>

        <div className="flex items-center gap-3">
          <IconBtn icon={<Settings size={14} className="text-yellow-400" />} label="VIP" />
          <IconBtn icon={<Clock size={14} className="text-cyan-400" />} label="First Team" />
          <IconBtn icon={<Clock size={14} className="text-cyan-400" />} label="Last Team" />
          <IconBtn icon={<User size={14} className="text-blue-400" />} label="Self" />
          <IconBtn icon={<Users size={14} className="text-cyan-300" />} label="2p" />
          <IconBtn icon={<Users size={14} className="text-cyan-300" />} label="3p" />
          <IconBtn icon={<Users size={14} className="text-cyan-300" />} label="5p" />
          <IconBtn icon={<Settings size={14} className="text-emerald-400" />} label="Operations" />
          <IconBtn icon={<Plus size={14} className="text-purple-400" />} label="Marshal" />
          <IconBtn icon={<Flag size={14} className="text-rose-400" />} label="Add 9 Holes" />
          <IconBtn icon={<Settings size={14} className="text-orange-400" />} label="Education" />
          <IconBtn icon={<Users size={14} className="text-yellow-400" />} label="Team" />
          <IconBtn icon={<AlertCircle size={14} className="text-red-500" />} label="Alerts" />
          <IconBtn icon={<MoreHorizontal size={14} className="text-rose-400" />} label="Top-dress" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Stand-by Carts */}
        <div className="w-24 bg-[#1a1a1a] border-r border-gray-800 p-2 flex flex-col gap-4 shadow-2xl z-10">
          <h3 className="text-[10px] font-black text-gray-500 uppercase text-center border-b border-gray-800 pb-2 tracking-widest">Stand-by Carts</h3>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-black text-[10px] tracking-tighter">#106</span>
              <div className="relative">
                <Flag size={18} fill="#e11d48" className="text-white/20" />
              </div>
              <span className="text-white font-black text-xs italic">210</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-black text-[10px] tracking-tighter">#78</span>
              <div className="relative">
                <Flag size={18} fill="#e11d48" className="text-white/20" />
              </div>
              <span className="text-white font-black text-xs italic">427</span>
            </div>
          </div>
        </div>

        {/* Main Content - Hole Monitoring */}
        <div className="flex-1 overflow-auto bg-[#0a0a0a] custom-scrollbar relative">
          <div 
            className="p-6 space-y-6 transition-transform duration-200 ease-out origin-top-left"
            style={{ 
              transform: `scale(${screenRatio / 100})`,
              width: `${10000 / screenRatio}%`,
            }}
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Teams" value="12" subValue="Active" color="text-sky-400" />
              <StatCard label="Pace Status" value="On Time" subValue="92%" color="text-emerald-400" />
              <StatCard label="Slow Teams" value="2" subValue="Attention" color="text-rose-500" />
              <StatCard label="Wait Time" value="4m" subValue="Average" color="text-amber-400" />
            </div>

            {/* OUT Course Section */}
            <div className="relative border border-rose-500/20 rounded-xl p-4 bg-[#111111] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex flex-col items-center justify-center border-r border-rose-500/30 pr-4 mr-2">
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">OUT</span>
                  <span className="text-xl font-black text-white italic">2</span>
                </div>
                <div className="flex-1 h-20 bg-black/40 rounded-lg flex items-center px-4 border border-white/5 shadow-inner">
                  <div className="grid grid-cols-9 gap-4 w-full">
                    {realOutHoles.map((h) => (
                      <HoleColumn 
                        key={h.hole} 
                        id={`hole-container-${h.hole}`}
                        label={`Hole ${h.hole}`} 
                        playerCount={h.players.length} 
                        players={h.players} 
                        isHighlighted={highlightedHole === h.hole}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 h-16 bg-[#0a0a0a] rounded border border-white/5 flex items-center px-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Messages by course</span>
              </div>
            </div>

            {/* IN Course Section */}
            <div className="relative border border-yellow-500/20 rounded-xl p-4 bg-[#111111] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex flex-col items-center justify-center border-r border-yellow-500/30 pr-4 mr-2">
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">IN</span>
                  <span className="text-xl font-black text-white italic">5</span>
                </div>
                <div className="flex-1 h-20 bg-black/40 rounded-lg flex items-center px-4 border border-white/5 shadow-inner">
                  <div className="grid grid-cols-9 gap-4 w-full">
                    {realInHoles.map((h) => (
                      <HoleColumn 
                        key={h.hole} 
                        id={`hole-container-${h.hole}`}
                        label={`Hole ${h.hole}`} 
                        playerCount={h.players.length} 
                        players={h.players} 
                        isHighlighted={highlightedHole === h.hole}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 h-16 bg-[#0a0a0a] rounded border border-white/5 flex items-center px-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Messages by course</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat Panel */}
        <div className="w-80 bg-[#1a1a1a] border-l border-gray-800 flex flex-col shadow-2xl z-10">
          <div className="p-4 bg-sky-600 flex items-center justify-between text-[11px] font-black uppercase tracking-widest shadow-lg">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>CHAT PANEL</span>
            </div>
            <div className="flex gap-4">
              <AlertCircle size={14} className="cursor-pointer hover:text-red-200" />
              <Clock size={14} className="cursor-pointer hover:text-red-200" />
              <Monitor size={14} className="cursor-pointer hover:text-red-200" />
              <Layout size={14} className="cursor-pointer hover:text-red-200" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
            {messages.map((m) => (
              <div key={m.id} className="space-y-1.5 group">
                <div className="flex justify-between text-[10px] font-black text-gray-500 tracking-tighter">
                  <span className="text-emerald-500">{m.cart}</span>
                  <span>{m.time}</span>
                </div>
                <div className="bg-[#2d3a3a] p-3 rounded-xl border-l-4 border-emerald-500 text-xs font-medium text-gray-200 shadow-lg group-hover:bg-[#344545] transition-colors">
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 bg-[#111111]">
            <div className="flex gap-3">
              <textarea 
                className="flex-1 bg-gray-900 rounded-xl border border-gray-800 p-3 text-xs outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 h-20 resize-none transition-all placeholder:text-gray-600"
                placeholder="Send Message to All Teams..."
              ></textarea>
              <button className="bg-rose-600 px-4 rounded-xl flex flex-col items-center justify-center hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-rose-600/20">
                <Send size={18} />
                <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Send</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border-t border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3 ml-1">
              <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Quick Memos</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <MemoBtn text="Hole di depan kosong, mohon kerja samanya." />
              <MemoBtn text="(Kabut tebal) Harap berhati-hati saat memukul." />
              <MemoBtn text="(Prakiraan petir) Mohon hentikan permainan sementara." />
              <MemoBtn text="Jalur pemandu cart dihentikan sementara." />
            </div>
          </div>
        </div>
      </div>

      {/* Caddie Search Modal */}
      {showCaddieSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#2d3a3a] rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#3a4a4a] p-4 flex items-center justify-center relative border-b border-white/5">
              <h2 className="text-white font-black uppercase tracking-widest text-[11px]">Real-time Caddie/Cart Search</h2>
            </div>
            <div className="p-8 space-y-6 bg-[#1a1a1a]">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enter caddie name/cart number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-white rounded-md px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner text-sm"
                    autoFocus
                    value={caddieSearchQuery}
                    onChange={(e) => {
                      setCaddieSearchQuery(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCaddieSearch()}
                    placeholder="Contoh: 001 atau #106"
                  />
                  <button 
                    onClick={handleCaddieSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 p-2 rounded-md hover:bg-emerald-500 transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {caddieSearchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Hasil Pencarian ({caddieSearchResults.length})</span>
                  {caddieSearchResults.map((result, i) => (
                    <button 
                      key={i}
                      onClick={() => locateCaddie(result.hole)}
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black italic">
                          {result.id}
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Cart/Caddie {result.id}</span>
                          <span className="text-[10px] text-gray-400">Sedang berada di Hole {result.hole}</span>
                        </div>
                      </div>
                      <div className="bg-emerald-600/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded border border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        LOCATE
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {caddieSearchQuery && caddieSearchResults.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase italic">Caddie/Cart tidak ditemukan di lapangan</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowCaddieSearchModal(false)}
                  className="flex-1 bg-[#4a5a5a] hover:bg-[#5a6a6a] text-white font-black py-2.5 rounded transition-all active:scale-95 uppercase tracking-widest text-[11px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-800 p-5 flex items-center justify-center relative">
              <div className="absolute left-5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Real-time Customer Search</h2>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Enter customer name</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Type name here..."
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-600/20 uppercase tracking-widest text-sm">Search</button>
                <button 
                  onClick={() => setShowSearchModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IconBtn = ({ icon, label }: any) => (
  <button className="flex flex-col items-center gap-1.5 group min-w-[50px]">
    <div className="bg-white/5 hover:bg-white/15 p-2 rounded-xl transition-all group-active:scale-90 border border-white/5 group-hover:border-white/10">
      {icon}
    </div>
    <span className="text-[9px] font-black text-gray-500 group-hover:text-gray-300 uppercase tracking-tighter transition-colors">{label}</span>
  </button>
);

const HoleColumn = ({ id, label, playerCount, players, isHighlighted }: any) => {
  // Determine hole status based on player count and speed (mock)
  const isSlow = players.some((p: any) => p.speed === 'slow');

  return (
    <div id={id} className={`flex flex-col items-center gap-1 group min-w-[110px] transition-all duration-500 rounded-lg p-1 ${isHighlighted ? 'bg-blue-600/30 ring-2 ring-blue-500 scale-110 z-20' : ''}`}>
      <span className={`text-[11px] font-black group-hover:text-white transition-colors tracking-tighter uppercase mb-2 ${isHighlighted ? 'text-blue-400' : 'text-gray-400'}`}>
        {label}{playerCount > 0 ? `(${playerCount})` : ''}
      </span>
      
      <div className="w-full h-1 relative flex items-center px-1">
        {/* Progress Track (Horizontal Bar) */}
        <div className="w-full h-2 bg-[#444444] rounded-sm shadow-inner"></div>
        
        {players.map((p: any, i: number) => (
          <div 
            key={i} 
            className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out z-10" 
            style={{ left: `${p.pos}%`, transform: 'translateX(-50%)' }}
          >
            {/* Cart No Above */}
            <span className="absolute -top-6 text-[10px] font-black text-white whitespace-nowrap">
              {p.id}
            </span>
            
            {/* Flag Marker */}
            <div className="relative -mt-1">
              <Flag size={14} fill={p.color === 'red' ? '#e11d48' : '#fbbf24'} className="text-white/40" />
              {p.speed === 'slow' && (
                <div className="absolute -inset-1 border border-rose-500 rounded-full animate-ping opacity-50"></div>
              )}
            </div>

            {/* Distance Below */}
            <span className="absolute top-4 text-[9px] font-black text-gray-500 whitespace-nowrap tabular-nums">
              {p.dist}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MemoBtn = ({ text }: { text: string }) => (
  <button className="w-full text-left p-3 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all active:scale-[0.98]">
    {text}
  </button>
);

const StatCard = ({ label, value, subValue, color }: any) => (
  <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 shadow-lg group hover:border-white/10 transition-all">
    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-end gap-2 mt-1">
      <span className={`text-2xl font-black ${color} tracking-tighter italic`}>{value}</span>
      <span className="text-[10px] font-bold text-gray-600 mb-1 uppercase">{subValue}</span>
    </div>
  </div>
);

export default CourseMonitoring;
