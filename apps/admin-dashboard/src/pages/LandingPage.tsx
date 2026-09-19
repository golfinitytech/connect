import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tablet, Printer, GraduationCap, TabletSmartphone } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const menus = [
    {
      title: 'Menu Administrator',
      description: 'Kelola data pelanggan, caddie, dan pengaturan sistem.',
      icon: <LayoutDashboard size={48} className="text-blue-600" />,
      path: '/admin/login',
      color: 'hover:border-blue-500 hover:shadow-blue-100',
    },
    {
      title: 'Menu Tablet',
      description: 'Akses mode Caddie untuk pencatatan skor di lapangan.',
      icon: <TabletSmartphone size={48} className="text-emerald-600" />,
      path: '/location',
      color: 'hover:border-emerald-500 hover:shadow-emerald-100',
    },
    {
      title: 'Menu Print Score',
      description: 'Cetak kartu skor melalui mesin KIOSK.',
      icon: <Printer size={48} className="text-purple-600" />,
      path: '/user/kiosk/print',
      color: 'hover:border-purple-500 hover:shadow-purple-100',
    },
    {
      title: 'Menu Portal Akademik',
      description: 'Akses portal pembelajaran dan evaluasi akademi.',
      icon: <GraduationCap size={48} className="text-orange-600" />,
      path: '/portalakademik/login',
      color: 'hover:border-orange-500 hover:shadow-orange-100',
    },
  ];

  const handleNavigation = (path: string) => {
    if (path.startsWith('http')) {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic">
          GOLFINITY<span className="text-blue-600">SCORE</span>
        </h1>
        <p className="text-slate-500 font-medium">Selamat datang! Silakan pilih menu untuk melanjutkan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {menus.map((menu, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(menu.path)}
            className={`bg-white border-2 border-slate-100 rounded-3xl p-8 text-left transition-all duration-300 group ${menu.color} hover:scale-105 active:scale-95 shadow-xl shadow-slate-200/50`}
          >
            <div className="bg-slate-50 rounded-2xl p-4 w-fit mb-6 group-hover:bg-white transition-colors">
              {menu.icon}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3 leading-tight uppercase">
              {menu.title}
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {menu.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-16 text-slate-400 text-sm font-bold tracking-widest uppercase">
        &copy; 2026 GOLFINITYSCORE. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
};

export default LandingPage;
