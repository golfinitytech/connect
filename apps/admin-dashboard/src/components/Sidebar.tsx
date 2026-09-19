import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Flag, 
  UserCircle, 
  Monitor, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Home as HomeIcon,
  Menu,
  X,
  Terminal,
  Settings
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, children, sidebarOpen, onClick }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-1 relative group">
      <button 
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (onClick) onClick();
        }}
        className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all`}
        title={!sidebarOpen ? label : ''}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">{label}</span>}
        </div>
        {sidebarOpen && children && (
          isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}
      </button>
      
      {/* Sub-menu for Expanded Sidebar */}
      {sidebarOpen && isExpanded && children && (
        <div className="ml-9 mt-1 flex flex-col gap-1 border-l border-white/10">
          {children}
        </div>
      )}

      {/* Popover Sub-menu for Collapsed Sidebar (Icon only) */}
      {!sidebarOpen && children && (
        <div className="fixed left-20 ml-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-[100]">
          <div className="bg-[#004741] border border-white/20 rounded-2xl shadow-xl p-3 min-w-[200px] flex flex-col gap-1">
            <div className="px-3 py-2 mb-1 border-b border-white/10">
              <span className="font-black text-[10px] text-white/90 uppercase tracking-widest">{label}</span>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const SubSidebarItem = ({ label, to }: { label: string, to: string }) => (
  <Link 
    to={to} 
    className="p-2 text-[11px] font-bold text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-2"
  >
    {label}
  </Link>
);

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const locationId = localStorage.getItem('adminLocationId') || 'karawang';

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminLocation');
    localStorage.removeItem('adminLocationId');
    navigate('/admin/login');
  };

  const getTabletPath = () => {
    switch(locationId) {
      case 'sulaiman': return '/userpadanggolfsulaiman';
      case 'jatinangor': return '/userjatinangorgolf';
      default: return '/userpalmspringkarawang';
    }
  };

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#004741] border-r border-white/10 transition-all duration-300 flex flex-col text-white fixed h-full z-20 shadow-sm`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        {sidebarOpen && <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">GOLF<span className="text-[#16D84E]">INITY</span></h1>}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Link to="/admin" className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl mb-6 transition-all shadow-sm border border-transparent hover:border-white/10`} title={!sidebarOpen ? "HOME" : ""}>
          <HomeIcon size={20} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>}
        </Link>

        {sidebarOpen && <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-3">Operations</div>}
        <SidebarItem icon={Users} label="Caddies" sidebarOpen={sidebarOpen} onClick={() => {}}>
          <SubSidebarItem label="All Caddies" to="/admin/caddies" />
          <SubSidebarItem label="Manage Caddies" to="/admin/caddies/manage" />
          <SubSidebarItem label="Caddie Performance" to="/admin/caddies/performance" />
          <SubSidebarItem label="Caddie Rating" to="/admin/caddies/rating" />
          <SubSidebarItem label="Caddie Order History" to="/admin/caddies/orders" />
          <SubSidebarItem label="Snack Bar Orders" to="/admin/caddies/snack-bar" />
        </SidebarItem>

        <SidebarItem icon={Flag} label="Rounds" sidebarOpen={sidebarOpen} onClick={() => {}}>
          <SubSidebarItem label="All Rounds" to="/admin/rounds" />
          <SubSidebarItem label="Group Rounds" to="/admin/rounds/groups" />
          
          <div className="mt-6 mb-3 ml-2 flex items-center gap-2">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Mode Caddie</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="flex flex-col gap-1 ml-2">
            <Link 
              to="/admin/rounds/caddie-activities" 
              className="p-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              Recent Activities
            </Link>
          </div>

          <div className="mt-6 mb-3 ml-2 flex items-center gap-2">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Tournament</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          
          <div className="flex flex-col gap-1 ml-2">
            <Link 
              to="/admin/rounds/list-tournament" 
              className="p-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
              List Tournament
            </Link>
            
            <Link 
              to="/admin/rounds/create-tournament" 
              className="p-2.5 text-[11px] text-white bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              Add New Tournament
            </Link>
            
            <Link 
              to="/admin/rounds/tournament-players" 
              className="p-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
              List Players
            </Link>
            
            <Link 
              to="/admin/rounds/tournament-configuration" 
              className="p-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:scale-150 transition-transform"></div>
              Configuration
            </Link>
            
            <Link 
              to="/admin/rounds/tournament-rules" 
              className="p-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-150 transition-transform"></div>
              Rules
            </Link>
            
            <Link 
              to="/admin/rounds/live-score" 
              className="p-2.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold tracking-wide flex items-center gap-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
              Live Score
            </Link>
          </div>
        </SidebarItem>

        {sidebarOpen && <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-6 mb-3 ml-3">Customer Care</div>}
        <SidebarItem icon={UserCircle} label="Customers" sidebarOpen={sidebarOpen} onClick={() => {}}>
          <SubSidebarItem label="Manage Customers" to="/admin/customers" />
          <SubSidebarItem label="Message History" to="/admin/customers/messages" />
        </SidebarItem>

        <SidebarItem icon={Monitor} label="Monitoring" sidebarOpen={sidebarOpen} onClick={() => {}}>
          <SubSidebarItem label="Pop-up Settings" to="/admin/monitor/popups" />
          <SubSidebarItem label="Device Monitoring" to="/admin/monitor/devices" />
          <SubSidebarItem label="Course Monitoring" to="/admin/monitor/course" />
          <SubSidebarItem label="Monitoring Score Tournament" to="/admin/monitor/tournament-score" />
          <SubSidebarItem label="System Debug/Logs" to="/admin/system-debug" />
        </SidebarItem>

        {sidebarOpen && <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-6 mb-3 ml-3">Settings</div>}
        <SidebarItem icon={Settings} label="Configuration" sidebarOpen={sidebarOpen} onClick={() => {}}>
          <SubSidebarItem label="Reset Score" to="/admin/configuration/reset-score" />
          <SubSidebarItem label="Check System" to="/admin/configuration/check-database" />
        </SidebarItem>

        {sidebarOpen && <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-6 mb-3 ml-3">Public View</div>}
        <Link to={getTabletPath()} target="_blank" className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-3 text-[#16D84E] hover:bg-white/10 rounded-xl mb-1 transition-all font-bold`} title={!sidebarOpen ? "Tablet View" : ""}>
          <Monitor size={20} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Tablet View</span>}
        </Link>
        <Link to={`${getTabletPath()}/marshall`} target="_blank" className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-3 text-[#16D84E] hover:bg-white/10 rounded-xl mb-1 transition-all font-bold`} title={!sidebarOpen ? "Marshal View" : ""}>
          <Terminal size={20} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Marshal View</span>}
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-3 text-white/50 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-all`}
          title={!sidebarOpen ? "Log out" : ""}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
