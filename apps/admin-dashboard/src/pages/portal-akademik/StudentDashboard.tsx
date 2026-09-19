import React from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  User,
  BookOpen,
  History,
  BarChart2,
  GraduationCap,
  MessageSquare,
  Star,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const studentName = user?.name || 'Student';
  const studentInitials = user?.name ? getInitials(user.name) : 'S';

  // Logic to determine coach based on login (same logic as in StudentManagement)
  let coachName = 'Ana Suhana'; // Default
  if (['Regi', 'Hadi', 'Fakih', 'Ridho'].includes(studentName)) {
    coachName = 'Anang Mulyanto';
  } else if (studentName === 'John Doe') {
    coachName = 'Apep Benhur';
  }

  const stats = [
    { label: 'Total Sessions', value: '24', icon: <Target className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Current Level', value: '1a', icon: <Trophy className="text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Attendance', value: '92%', icon: <Calendar className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Next Milestone', value: '85%', icon: <TrendingUp className="text-purple-600" />, bg: 'bg-purple-50' },
  ];

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={28} />, path: '/student/dashboard', color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'My Training Program', icon: <Target size={28} />, path: '/student/program', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Syllabus', icon: <BookOpen size={28} />, path: '/student/syllabus', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Session Tracker', icon: <History size={28} />, path: '/student/tracker', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Performance & Evaluation', icon: <BarChart2 size={28} />, path: '/student/evaluation', color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Learning Center', icon: <GraduationCap size={28} />, path: '/student/learning', color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Schedule', icon: <Calendar size={28} />, path: '/student/schedule', color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Messages', icon: <MessageSquare size={28} />, path: '/student/messages', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Feedback', icon: <Star size={28} />, path: '/student/feedback', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Profile', icon: <User size={28} />, path: '/student/profile', color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Utama</h1>
          <p className="text-gray-500 mt-2 text-lg">Selamat datang kembali, {studentName}. Siap untuk berlatih hari ini?</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              Pelatih Anda: {coachName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-[#004d40] flex items-center justify-center text-white font-bold">{studentInitials}</div>
          <div className="pr-4">
            <p className="text-sm font-bold text-gray-900 leading-none">{studentName}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Student • Level 1a</p>
          </div>
        </div>
      </div>

      {/* Main Menu Grid from Slide 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-20 h-20 rounded-[24px] ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.name}</h3>
              <p className="text-xs text-gray-400 font-medium mt-1">Akses cepat ke {item.name.toLowerCase()}</p>
            </div>
            <div className="mt-2 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
              <ChevronRight size={20} />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Statistik Latihan</h2>
          <button className="text-emerald-600 font-bold text-sm hover:underline">Lihat Detail</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
