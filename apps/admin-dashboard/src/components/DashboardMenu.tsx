import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Home, 
  Bell, 
  X, 
  Settings2, 
  Map, 
  Camera, 
  UtensilsCrossed, 
  ClipboardList, 
  Image as ImageIcon, 
  MessageSquare, 
  Send, 
  Briefcase
} from 'lucide-react';

import ScoreSubmissionModal from './ScoreSubmissionModal';
import IncompleteRoundModal from './IncompleteRoundModal';

interface DashboardMenuProps {
  onOpenRoundSettings: () => void;
  onOpenDeviceSettings?: () => void;
  onClose?: () => void;
  caddieId?: string;
  version?: string;
  tabId?: string;
  isLockedMode: boolean;
  onLockedModeChange: (val: boolean) => void;
  playerData?: any[];
  onRefreshData?: () => void;
}

const DashboardMenu = ({ 
  onOpenRoundSettings, 
  onOpenDeviceSettings,
  onClose,
  caddieId = "305", 
  version = "V 5.1.9", 
  tabId = "540835",
  isLockedMode,
  onLockedModeChange,
  playerData = [],
  onRefreshData
}: DashboardMenuProps) => {
  const navigate = useNavigate();
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  // State for modals
  const [isScoreSubmissionOpen, setIsScoreSubmissionOpen] = useState(false);
  const [isIncompleteModalOpen, setIsIncompleteModalOpen] = useState(false);

  // State for toggles
  const [isTotalScoreInput, setIsTotalScoreInput] = useState(false);
  const [isTotalStrokes, setIsTotalStrokes] = useState(false);

  const handleSendClick = () => {
    // Refresh data from localStorage via parent callback
    if (onRefreshData) onRefreshData();

    // Pastikan kita mendapatkan data terbaru dari localStorage jika onRefreshData tidak langsung mengupdate playerData
    const savedScores = localStorage.getItem('golf_players_scores');
    let currentPlayers = playerData;
    if (savedScores) {
      currentPlayers = JSON.parse(savedScores);
    }

    // Periksa apakah ada minimal satu pemain dengan nama yang valid (bukan '-')
    const hasValidPlayer = currentPlayers.some(player => player.name && player.name !== '-');
    if (!hasValidPlayer) {
      setIsIncompleteModalOpen(true);
      return;
    }

    // Check if any valid player has completed all 18 holes
    const isRoundComplete = currentPlayers.some(player => {
      if (!player.name || player.name === '-') return false;
      const allIn = player.scores.IN.every((s: any) => s !== null && s !== 0); // Asumsikan 0 berarti belum diinput
      const allOut = player.scores.OUT.every((s: any) => s !== null && s !== 0);
      return allIn && allOut;
    });

    if (isRoundComplete) {
      setIsScoreSubmissionOpen(true);
    } else {
      setIsIncompleteModalOpen(true);
    }
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 overflow-hidden animate-in fade-in duration-300">
      {/* Hidden file input for camera access */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef} 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            console.log("Captured image:", e.target.files[0]);
          }
        }}
      />

      {/* Hidden file input for gallery access */}
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef} 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            console.log("Selected from gallery:", e.target.files[0]);
          }
        }}
      />
      
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white text-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <header className="flex justify-between items-center px-10 py-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-medium text-slate-400">Caddie</span>
            <span className="text-2xl font-bold text-slate-700">{caddieId}</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600">
            <Home size={28} className="cursor-pointer hover:text-slate-900 transition-colors" />
            <Settings 
              size={28} 
              className="cursor-pointer hover:text-slate-900 transition-colors" 
              onClick={onOpenDeviceSettings}
            />
            <Bell size={28} className="cursor-pointer hover:text-slate-900 transition-colors" />
            <X 
              size={32} 
              className="cursor-pointer hover:text-slate-900 transition-colors ml-4" 
              onClick={onClose}
            />
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
          {/* Left Section: Icons Menu */}
          <div className="col-span-7 grid grid-cols-3 gap-y-12 gap-x-4 p-10 pt-4">
            <MenuItem 
              icon={<Settings2 size={24} />} 
              label="Pengaturan Ronde" 
              onClick={onOpenRoundSettings} 
            />
            <MenuItem icon={<Map size={24} />} label="Yardage" />
            <MenuItem 
              icon={<Send size={24} />} 
              label="Kirim" 
              onClick={handleSendClick}
            />
            
            <MenuItem 
              icon={<Camera size={24} />} 
              label="Camera" 
              onClick={handleCameraClick}
            />
            <MenuItem 
              icon={<UtensilsCrossed size={24} />} 
              label="Menu Resto" 
              onClick={() => navigate('../resto-menu')}
            />
            <MenuItem icon={<Briefcase size={24} />} label="Club Check" />
            
            <MenuItem 
              icon={<ClipboardList size={24} />} 
              label="Catatan Caddie" 
              onClick={() => navigate('../caddie-notes')}
            />
            <MenuItem 
              icon={<ImageIcon size={24} />} 
              label="Galeri" 
              onClick={handleGalleryClick}
            />
            <MenuItem icon={<MessageSquare size={24} />} label="Pesan" />
          </div>

          {/* Right Section: Switches & Progress */}
          <div className="col-span-5 space-y-10 bg-slate-50/80 p-10 pt-8 border-l border-slate-100">
            <div className="space-y-6">
              <ToggleItem 
                label="Mode Kunci" 
                checked={isLockedMode} 
                onChange={onLockedModeChange} 
              />
              <div className="space-y-4 pt-6">
                <h3 className="text-slate-800 font-bold text-base">Mode Total Skor</h3>
                <ToggleItem 
                  label="Input Total Skor" 
                  checked={isTotalScoreInput} 
                  onChange={setIsTotalScoreInput} 
                />
                <ToggleItem 
                  label="Total Pukulan" 
                  checked={isTotalStrokes} 
                  onChange={setIsTotalStrokes} 
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-200">
              <h3 className="text-slate-800 font-bold text-base">Waktu Progres</h3>
              <div className="flex items-center gap-4">
                <span className="text-blue-500 font-bold text-lg mr-4">OUT</span>
                <button 
                  onClick={async () => {
                    // Start progress - create an activity in the backend
                    const locationId = localStorage.getItem('adminLocationId') || 'karawang';
                    const savedScores = localStorage.getItem('golf_players_scores');
                    let currentPlayers = playerData;
                    if (savedScores) {
                      try {
                        currentPlayers = JSON.parse(savedScores);
                      } catch (e) {}
                    }
                    
                    try {
                      // @ts-ignore
                      const { default: api } = await import('../services/api');
                      await api.post('/tournaments/rounds', {
                        locationId,
                        caddieCode: caddieId,
                        players: currentPlayers.map(p => ({ name: p.name || 'Unknown' })),
                        startTime: new Date().toISOString(),
                        isCompleted: false
                      });
                    } catch (e) {
                      console.error('Failed to start round activity', e);
                    }
                    
                    navigate('../scorecard');
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Mulai
                </button>
                <button className="flex-1 border-2 border-slate-200 text-slate-300 font-bold py-3.5 rounded-xl cursor-not-allowed">
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="px-10 py-6 mt-auto flex items-center gap-3 text-slate-400 font-medium text-sm">
          <div className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">WSS</div>
          <span>{version} / TabID - {tabId}</span>
        </footer>
      </div>

      <ScoreSubmissionModal 
        isOpen={isScoreSubmissionOpen}
        onClose={() => setIsScoreSubmissionOpen(false)}
        players={playerData}
      />

      <IncompleteRoundModal 
        isOpen={isIncompleteModalOpen}
        onClose={() => setIsIncompleteModalOpen(false)}
        onConfirm={() => setIsScoreSubmissionOpen(true)}
      />
    </div>
  );
};

const MenuItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-4 cursor-pointer group hover:bg-slate-50 p-2 rounded-2xl transition-all active:scale-95"
  >
    <div className="w-10 h-10 flex items-center justify-center text-slate-500 group-hover:text-slate-800 transition-colors">
      {icon}
    </div>
    <span className="text-xl font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
      {label}
    </span>
  </div>
);

const ToggleItem = ({ 
  label, 
  checked = false, 
  onChange 
}: { 
  label: string, 
  checked?: boolean, 
  onChange?: (val: boolean) => void 
}) => (
  <div className="flex items-center justify-between">
    <span className="text-lg font-bold text-slate-700">{label}</span>
    <div 
      onClick={() => onChange?.(!checked)}
      className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${checked ? 'right-1' : 'left-1'}`} />
    </div>
  </div>
);

export default DashboardMenu;
