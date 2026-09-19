import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeaderNotifications from './HeaderNotifications';

const Header = () => {
  const navigate = useNavigate();
  const locationName = localStorage.getItem('adminLocation') || 'Palm Springs Karawang';

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminLocation');
    localStorage.removeItem('adminLocationId');
    navigate('/admin/login');
  };

  return (
    <header className="bg-[#004741] text-white h-16 flex items-center justify-between px-6 sticky top-0 z-10 border-b border-white/10 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-[#16D84E] font-bold uppercase tracking-widest text-[10px]">Course management</span>
        <span className="text-white/20">|</span>
        <span className="font-black text-white uppercase tracking-tighter">{locationName}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <HeaderNotifications />
        <div className="relative">
          <select className="bg-white/10 text-white text-xs font-bold border border-white/20 rounded-lg px-3 py-1.5 outline-none appearance-none cursor-pointer pr-8">
            <option className="text-slate-800">English</option>
            <option className="text-slate-800">Bahasa Indonesia</option>
            <option className="text-slate-800">日本語</option>
            <option className="text-slate-800">한국어</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs hover:text-rose-400 transition-colors font-black uppercase tracking-widest text-white/50 flex items-center gap-2"
        >
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;
