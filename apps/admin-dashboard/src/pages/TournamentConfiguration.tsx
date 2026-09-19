import React, { useState } from 'react';
import { 
  Settings2, 
  Layout, 
  Users2, 
  Scale, 
  Trophy,
  Save,
  ChevronRight,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';

const TournamentConfiguration = () => {
  const [config, setConfig] = useState({
    globalLeaderboard: true,
    categoryLeaderboard: true,
    combinedCategoryRules: 'Best of All',
    tieBreakRules: 'Countback',
    maxPlayersPerFlight: 40
  });

  const currentAdminLocation = localStorage.getItem('adminLocation') || 'Padang Golf Sulaiman';

  const handleSave = () => {
    localStorage.setItem('tournament_config', JSON.stringify(config));
    alert('Configuration saved successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Settings2 size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 uppercase italic">Tournament Configuration</h1>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Lock size={12} className="text-slate-400" />
              System Settings • {currentAdminLocation}
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Global & Category Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Trophy size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-800">Leaderboard Display</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-500/30 transition-all">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Global Leaderboard</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Show overall rankings for all flights</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, globalLeaderboard: !config.globalLeaderboard})}
                  className={`w-12 h-6 rounded-full transition-all relative ${config.globalLeaderboard ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.globalLeaderboard ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-500/30 transition-all">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Category Leaderboard</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Show rankings separated by Flight A/B/C</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, categoryLeaderboard: !config.categoryLeaderboard})}
                  className={`w-12 h-6 rounded-full transition-all relative ${config.categoryLeaderboard ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.categoryLeaderboard ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Max Players Per Flight */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                <Users2 size={20} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-800">Flight Limitations</h2>
            </div>

            <div className="space-y-4">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Max Players Per Flight</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={config.maxPlayersPerFlight}
                  onChange={(e) => setConfig({...config, maxPlayersPerFlight: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-2xl font-black text-amber-600 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Athletes</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-blue-700/70 leading-relaxed uppercase tracking-wider">
                  Limits the number of players that can be auto-grouped into a single flight category.
                </p>
              </div>
            </div>
          </div>

          {/* Combined Category Rules */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                <Layout size={20} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-800">Grouping Logic</h2>
            </div>

            <div className="space-y-4">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Combined Category Rules</label>
              <div className="grid grid-cols-1 gap-3">
                {['Best of All', 'Manual Assignment', 'Handicap Priority'].map((rule) => (
                  <button 
                    key={rule}
                    onClick={() => setConfig({...config, combinedCategoryRules: rule})}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.combinedCategoryRules === rule ? 'bg-purple-50 border-purple-500 text-purple-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    <span className="text-sm font-bold uppercase tracking-tight">{rule}</span>
                    {config.combinedCategoryRules === rule && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tie-break Rules */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                <Scale size={20} className="text-rose-600" />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-800">Winning Conditions</h2>
            </div>

            <div className="space-y-4">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Tie-break Rules</label>
              <div className="grid grid-cols-1 gap-3">
                {['Countback', 'Lower HCP', 'Sudden Death', 'Score Comparison'].map((rule) => (
                  <button 
                    key={rule}
                    onClick={() => setConfig({...config, tieBreakRules: rule})}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.tieBreakRules === rule ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    <span className="text-sm font-bold uppercase tracking-tight">{rule}</span>
                    {config.tieBreakRules === rule && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TournamentConfiguration;
