import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  Battery, 
  Signal, 
  Navigation, 
  Home, 
  Flag, 
  Grid, 
  Download, 
  Settings,
  Minus,
  ChevronDown,
  Globe
} from 'lucide-react';
import LanguageModal from '../components/LanguageModal';
import DeviceSettingsModal from '../components/DeviceSettingsModal';
import TopDressingConfirmModal from '../components/TopDressingConfirmModal';
import TopDressingSelectionModal from '../components/TopDressingSelectionModal';
import CaddieSelectionModal from '../components/CaddieSelectionModal';
import RoundSettings from '../components/RoundSettings';
import DashboardMenu from '../components/DashboardMenu';
import PasswordModal from '../components/PasswordModal';

const CaddieModeDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<'landing' | 'settings' | 'dashboard'>('landing');
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTopDressingConfirmOpen, setIsTopDressingConfirmOpen] = useState(false);
  const [isTopDressingSelectionOpen, setIsTopDressingSelectionOpen] = useState(false);
  const [isCaddieModalOpen, setIsCaddieModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLockedMode, setIsLockedMode] = useState(() => {
    const saved = localStorage.getItem('isLockedMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [selectedCaddie, setSelectedCaddie] = useState(() => {
    return localStorage.getItem('caddieCode') || '305';
  });
  const [currentLang, setCurrentLang] = useState('ID');
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [locationName, setLocationName] = useState('Palm Springs Karawang');

  useEffect(() => {
    // Determine location name based on URL path
    const path = window.location.pathname;
    if (path.includes('userpadanggolfsulaiman')) {
      setLocationName('Padang Golf Sulaiman');
    } else if (path.includes('userjatinangorgolf')) {
      setLocationName('Jatinangor National Golf');
    } else {
      setLocationName('Palm Springs Karawang');
    }
  }, []);

  useEffect(() => {
    // Set initial caddie from master data if available
    const savedCaddies = localStorage.getItem('golf_caddies_master');
    if (savedCaddies) {
      const parsed = JSON.parse(savedCaddies);
      if (parsed.length > 0) {
        setSelectedCaddie(parsed[0].name);
      }
    } else {
      const defaultCaddies = [
        { id: '001', name: '001', searchedName: 'Siti Aminah', gender: 'F', contact: '08123456789', qualificationDate: '2025-01-01', cartNo: '1', tabletNo: 'T01', batteryNo: 'B01' },
        { id: '002', name: '002', searchedName: 'Budi Santoso', gender: 'M', contact: '08123456790', qualificationDate: '2025-01-02', cartNo: '2', tabletNo: 'T02', batteryNo: 'B02' },
        { id: '117', name: '117', searchedName: 'Agnes Virani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '146', name: '146', searchedName: 'Putri Rahma Aulia', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '106', name: '106', searchedName: 'Heni Apriani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '137', name: '137', searchedName: 'Fitka Fatmawati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '141', name: '141', searchedName: 'Chintya Rahmawati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '112', name: '112', searchedName: 'Rika Veronika', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '108', name: '108', searchedName: 'Kurnia', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '128', name: '128', searchedName: 'Aprianti', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '122', name: '122', searchedName: 'Hilda Dwi Ananda', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '120', name: '120', searchedName: 'Desi Mulyanti', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '148', name: '148', searchedName: 'Shika Silviana A', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '151', name: '151', searchedName: 'Devi Purnomo', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '133', name: '133', searchedName: 'Anuti Sri Rahayu', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '123', name: '123', searchedName: 'Miswati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '121', name: '121', searchedName: 'Valeria Beku Nuamuri', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '145', name: '145', searchedName: 'Cahya Deshaningsih', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '131', name: '131', searchedName: 'Friska', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '104', name: '104', searchedName: 'Aura Adzania Berliantani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        { id: '129', name: '129', searchedName: 'Endah Wayanguri', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
      ];
      localStorage.setItem('golf_caddies_master', JSON.stringify(defaultCaddies));
      setSelectedCaddie(defaultCaddies[0].name);
    }
  }, []);

  const handleLockedModeChange = (val: boolean) => {
    setIsLockedMode(val);
    localStorage.setItem('isLockedMode', JSON.stringify(val));
  };

  // Function to load scores from localStorage (same as ScorecardView would use)
  const loadScoreData = () => {
    const savedScores = localStorage.getItem('golf_players_scores');
    const savedPlayersData = localStorage.getItem('golf_players_data');
    
    if (savedScores) {
      setPlayerData(JSON.parse(savedScores));
    } else {
      // Default structure
      const defaultPlayers = [
        { id: 1, name: '-', manualTotal: null, scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) } },
        { id: 2, name: '-', manualTotal: null, scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) } },
        { id: 3, name: '-', manualTotal: null, scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) } },
        { id: 4, name: '-', manualTotal: null, scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) } },
      ];

      if (savedPlayersData) {
        const playersData = JSON.parse(savedPlayersData);
        setPlayerData(defaultPlayers.map(p => {
          const matchingData = playersData.find((pd: any) => pd.id === p.id);
          if (matchingData && matchingData.name) {
            return { ...p, name: matchingData.name };
          }
          return p;
        }));
      } else {
        setPlayerData(defaultPlayers);
      }
    }
  };

  useEffect(() => {
    if (location.state?.view) {
      setView(location.state.view);
    }
    loadScoreData();
  }, [location.state]);

  // Sync selected caddie when returning to dashboard view
  useEffect(() => {
    if (view === 'dashboard') {
      const currentCaddieCode = localStorage.getItem('caddieCode');
      if (currentCaddieCode) {
        setSelectedCaddie(currentCaddieCode);
      }
    }
  }, [view]);

  const handleOpenDashboard = () => {
    if (isLockedMode) {
      setIsPasswordModalOpen(true);
    } else {
      setView('dashboard');
    }
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setView('dashboard');
  };

  if (view === 'settings') {
    return <RoundSettings onBack={() => setView('dashboard')} onReset={() => console.log('Reset settings')} />;
  }

  if (view === 'dashboard') {
    return (
      <>
        <DashboardMenu 
          onOpenRoundSettings={() => setView('settings')}
          onOpenDeviceSettings={() => setIsSettingsModalOpen(true)}
          onClose={() => setView('landing')}
          caddieId={selectedCaddie}
          isLockedMode={isLockedMode}
          onLockedModeChange={handleLockedModeChange}
          playerData={playerData}
          onRefreshData={loadScoreData}
        />
        <DeviceSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentLang={currentLang}
          onLangChange={(lang) => setCurrentLang(lang)}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#1a1a1a] font-sans text-white select-none flex flex-col overflow-hidden">
      {/* Background with blur/dimmed effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1600&auto=format&fit=crop')` }}
      />
      
      {/* Header */}
      <header className="relative z-10 flex items-center px-6 py-4">
        <div className="flex-1 flex justify-start">
          <button 
            onClick={() => navigate('../mode-selection')}
            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
            <span className="text-lg font-medium">Mode Caddie</span>
          </button>
        </div>
        
        <h1 className="text-2xl font-bold tracking-wide text-center">{locationName}</h1>
        
        <div className="flex-1 flex justify-end items-center gap-4 text-gray-300">
          <Battery size={24} className="rotate-90" />
          <Signal size={24} />
          <Navigation size={22} className="rotate-45" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-12">
        <div className="w-full max-w-xl space-y-12">
          {/* Inputs Section */}
          <div className="space-y-8">
            {/* Number Input (e.g. 305) */}
            <div 
              onClick={() => setIsCaddieModalOpen(true)}
              className="flex items-center gap-6 border-b-2 border-white/20 pb-4 cursor-pointer hover:border-white/40 transition-colors"
            >
              <button className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center hover:bg-white/10 transition-all pointer-events-none">
                <Minus size={24} />
              </button>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-5xl font-bold">{selectedCaddie}</span>
                <ChevronDown size={32} className="text-white/60" />
              </div>
            </div>

            {/* Caddie Selection Dropdown */}
            <div 
              onClick={() => setIsCaddieModalOpen(true)}
              className="flex items-center justify-between border-b-2 border-white/20 pb-4 cursor-pointer hover:border-white/40 transition-colors"
            >
              <span className="text-3xl font-medium text-white/80">Silakan pilih caddie</span>
              <ChevronDown size={32} className="text-white/60" />
            </div>
          </div>

          {/* Start Round Button */}
          <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => setIsTopDressingConfirmOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-16 py-5 rounded-full text-2xl font-bold shadow-2xl shadow-blue-600/40 transition-all active:scale-95"
                    >
                      Mulai ronde
                    </button>
                  </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="relative z-10 px-8 py-8">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-12">
            <button 
              onClick={() => navigate('..')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Home size={28} className="text-white/80" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Club Home</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Flag size={28} className="text-white/80" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Ronde Sebelumnya</span>
            </button>

            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Grid size={28} className="text-white/80" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Mode Top Dressing</span>
            </button>

            <button 
              onClick={() => navigate('../resto-menu')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Download size={28} className="text-white/80" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Update</span>
            </button>

            <button 
              onClick={() => setIsLangModalOpen(true)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Globe size={28} className="text-white/80" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Bahasa</span>
            </button>

            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Settings size={28} className="text-white/80" />
              </div>
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Pengaturan</span>
            </button>
          </div>

          <div className="text-right text-white/40 font-medium">
            <p className="text-xs">Device No : 540835</p>
            <p className="text-xs">V 5.1.9</p>
            <p className="text-[10px] tracking-tight">21.11.2.1326.2.0.1.63.0</p>
          </div>
        </div>
      </footer>

      <LanguageModal 
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        onSelect={(lang) => setCurrentLang(lang)}
        currentLang={currentLang}
      />

      <DeviceSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentLang={currentLang}
          onLangChange={(lang) => setCurrentLang(lang)}
        />

        <TopDressingConfirmModal 
          isOpen={isTopDressingConfirmOpen}
          onClose={() => setIsTopDressingConfirmOpen(false)}
          onConfirm={() => {
            setIsTopDressingConfirmOpen(false);
            setIsTopDressingSelectionOpen(true);
          }}
        />

        <TopDressingSelectionModal
          isOpen={isTopDressingSelectionOpen}
          onClose={() => setIsTopDressingSelectionOpen(false)}
          onSelect={(option) => {
            console.log('Selected Top Dressing option:', option);
            if (option === 'Buat Baru') {
              handleOpenDashboard();
            }
          }}
        />

        <PasswordModal 
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={handlePasswordSuccess}
        />

        <CaddieSelectionModal
          isOpen={isCaddieModalOpen}
          onClose={() => setIsCaddieModalOpen(false)}
          selectedCaddie={selectedCaddie}
          onSelect={(num) => {
            setSelectedCaddie(num);
            localStorage.setItem('caddieCode', num);
            
            // Also update the RoundSettings cached caddies so it reflects immediately
            try {
              const savedCaddies = localStorage.getItem('golf_selected_caddies');
              let caddiesList = ["", ""];
              if (savedCaddies) {
                caddiesList = JSON.parse(savedCaddies);
              }
              caddiesList[0] = num;
              caddiesList[1] = ""; // Reset the second caddie to "Tidak dipilih"
              localStorage.setItem('golf_selected_caddies', JSON.stringify(caddiesList));
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </div>
    );
};

export default CaddieModeDetail;
