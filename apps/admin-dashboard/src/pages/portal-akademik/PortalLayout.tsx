import React, { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearPortalSession, getPortalUser } from '../../services/academyApi';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Calendar, 
  MessageSquare, 
  User, 
  LogOut,
  ChevronLeft,
  BarChart2,
  GraduationCap,
  Star,
  Users,
  ClipboardCheck,
  ShieldCheck,
  UserCog,
  BarChart3,
  Target
} from 'lucide-react';

const PortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();
  // Re-read on navigation so login/logout are picked up.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const user = useMemo(() => getPortalUser(), [location.pathname]);

  const isCoach = location.pathname.includes('/portalakademik/coach');
  const isAdmin = location.pathname.includes('/portalakademik/admin');
  const isStudent = location.pathname.includes('/portalakademik/student');

  useEffect(() => {
    // If not on login page and no user is found, redirect to login
    const isLoginPage = location.pathname === '/portalakademik' || location.pathname === '/portalakademik/login' || location.pathname === '/portalakademik/login';
    
    if (!isLoginPage && !user) {
      navigate('/portalakademik/login');
      return;
    }

    // Role-based Access Control (RBAC)
    if (user) {
      if (isAdmin && user.role !== 'admin') {
        // User trying to access admin route but is not admin
        navigate(`/portalakademik/${user.role}/dashboard`);
      } else if (isCoach && user.role !== 'coach') {
        // User trying to access coach route but is not coach
        navigate(`/portalakademik/${user.role}/dashboard`);
      } else if (isStudent && user.role !== 'student') {
        // User trying to access student route but is not student
        navigate(`/portalakademik/${user.role}/dashboard`);
      }
    }
  }, [location.pathname, user, navigate, isAdmin, isCoach, isStudent]);

  const studentMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/portalakademik/student/dashboard' },
    { name: 'My Training Program', icon: <Target size={20} />, path: '/portalakademik/student/program' },
    { name: 'Syllabus', icon: <BookOpen size={20} />, path: '/portalakademik/student/syllabus' },
    { name: 'Session Tracker', icon: <History size={20} />, path: '/portalakademik/student/tracker' },
    { name: 'Performance & Evaluation', icon: <BarChart2 size={20} />, path: '/portalakademik/student/evaluation' },
    { name: 'Learning Center', icon: <GraduationCap size={20} />, path: '/portalakademik/student/learning' },
    { name: 'Schedule', icon: <Calendar size={20} />, path: '/portalakademik/student/schedule' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/portalakademik/student/messages' },
    { name: 'Feedback', icon: <Star size={20} />, path: '/portalakademik/student/feedback' },
    { name: 'Profile', icon: <User size={20} />, path: '/portalakademik/student/profile' },
  ];

  const coachMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/portalakademik/coach/dashboard' },
    { name: 'Manage Students', icon: <Users size={20} />, path: '/portalakademik/coach/students' },
    { name: 'Evaluations', icon: <ClipboardCheck size={20} />, path: '/portalakademik/coach/evaluations' },
    { name: 'Schedule', icon: <Calendar size={20} />, path: '/portalakademik/coach/schedule' },
    { name: 'Syllabus', icon: <BookOpen size={20} />, path: '/portalakademik/coach/syllabus' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/portalakademik/coach/messages' },
    { name: 'Profile', icon: <User size={20} />, path: '/portalakademik/coach/profile' },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/portalakademik/admin/dashboard' },
    { name: 'Curriculum', icon: <BookOpen size={20} />, path: '/portalakademik/admin/curriculum' },
    { name: 'Coaches', icon: <UserCog size={20} />, path: '/portalakademik/admin/coaches' },
    { name: 'Students', icon: <Users size={20} />, path: '/portalakademik/admin/students' },
    { name: 'Reports', icon: <BarChart3 size={20} />, path: '/portalakademik/admin/reports' },
    { name: 'Hub Settings', icon: <ShieldCheck size={20} />, path: '/portalakademik/admin/settings' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : (user?.role === 'coach' ? coachMenuItems : studentMenuItems);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const userInfo = {
    name: user?.name || (user?.role === 'admin' ? 'Admin Director' : (user?.role === 'coach' ? 'Coach' : 'Student')),
    role: user?.role === 'admin'
      ? 'Hub Director'
      : user?.role === 'coach'
        ? (user.specialty?.split('•')[0].trim() || 'Coach')
        : `Student${user?.program ? ` • ${user.program.level}` : ''}`,
    initials: user?.name ? getInitials(user.name) : (user?.role === 'admin' ? 'AD' : (user?.role === 'coach' ? 'C' : 'S')),
    image: user?.avatarUrl ?? undefined
  };

  const handleLogout = () => {
    clearPortalSession();
    queryClient.clear();
    navigate('/portalakademik');
  };

  const isLoginPage = location.pathname === '/portalakademik' || location.pathname === '/portalakademik/login' || location.pathname === '/portalakademik/login';

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#004d40] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#004d40] font-bold text-xl">G</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Golfinity Hub</h1>
            <p className="text-[10px] text-white/60">Hub Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{userInfo.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{userInfo.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#004d40] flex items-center justify-center text-white font-bold border-2 border-gray-100 shadow-sm overflow-hidden">
              {userInfo.image ? (
                <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
              ) : (
                userInfo.initials
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
