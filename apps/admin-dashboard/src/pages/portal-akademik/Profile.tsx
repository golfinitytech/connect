import React from 'react';
import { User, Mail, Phone, MapPin, Shield, Bell, CreditCard, ChevronRight, Camera } from 'lucide-react';

const Profile = () => {
  const storedUser = localStorage.getItem('portalUser');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const userInfo = {
    name: user?.name || 'User',
    role: user?.role === 'admin' ? 'Hub Director' : (user?.role === 'coach' ? 'Senior Coach' : 'Student • Level 1'),
    initials: user?.name ? getInitials(user.name) : 'U',
    image: user?.image,
    email: user?.email || (user?.name ? `${user.name.toLowerCase().replace(' ', '.')}@golfinity.com` : 'user@example.com')
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-emerald-900" />
            <div className="relative z-10">
              <div className="relative inline-block mt-4">
                <div className="w-32 h-32 rounded-[40px] bg-[#004d40] border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-bold mx-auto overflow-hidden">
                  {userInfo.image ? (
                    <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    userInfo.initials
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors border border-gray-100">
                  <Camera size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-6">{userInfo.name}</h3>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">{userInfo.role}</p>
              
              <div className="flex justify-center gap-4 mt-8">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{user?.role === 'coach' ? '150+' : '24'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user?.role === 'coach' ? 'Students' : 'Sessions'}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 mt-1" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">4.9</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                </div>
                <div className="w-px h-8 bg-gray-100 mt-1" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{user?.role === 'coach' ? '8' : '12'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user?.role === 'coach' ? 'Years Exp' : 'Badges'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-gray-700">{userInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-gray-700">+62 812 3456 7890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-bold text-gray-700">Jakarta, Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">Account Settings</h4>
            <div className="divide-y divide-gray-100">
              {[
                { name: 'Security & Password', icon: <Shield size={20} />, desc: 'Manage your password and security settings' },
                { name: 'Notifications', icon: <Bell size={20} />, desc: 'Control which notifications you receive' },
                { name: 'Payment Methods', icon: <CreditCard size={20} />, desc: 'Manage your credit cards and billing info' },
                { name: 'Privacy Settings', icon: <User size={20} />, desc: 'Control your profile visibility' },
              ].map((item, i) => (
                <button key={i} className="w-full py-6 flex items-center justify-between group first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{item.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-900">Membership Details</h4>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
            </div>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-emerald-900">Hub Pro Membership</h5>
                  <p className="text-xs text-emerald-700 mt-1">Valid until Dec 31, 2026</p>
                </div>
                <button className="bg-white text-emerald-700 px-6 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-100 transition-all">
                  Renew Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
