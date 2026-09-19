import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';

interface Notification {
  id: string;
  roleInfo: string;
  changedHole: number;
  changedPlayerName: string;
  newScore: number;
  time: Date;
  read: boolean;
  isApproved?: boolean;
  isMarshalEdit?: boolean;
  groupCode?: string;
}

const HeaderNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Move lastNotifCount outside of useEffect so it persists across renders
  const lastNotifCountRef = useRef(0);

  // Poll for notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/admin-notifications');
        const dbNotifs = response.data.map((n: any) => ({
          ...n,
          time: new Date(n.createdAt),
          read: n.read
        }));
        
        setNotifications(dbNotifs);
        
        // If there's a new notification, force open the dropdown temporarily
        const currentUnreadCount = dbNotifs.filter((n: any) => !n.read).length;
        setUnreadCount(currentUnreadCount);

        if (currentUnreadCount > lastNotifCountRef.current) {
           setIsOpen(true);
           
           // Clear any existing timeout before setting a new one
           if (hideTimeoutRef.current) {
             clearTimeout(hideTimeoutRef.current);
           }

           // Auto-hide after 5 seconds
           hideTimeoutRef.current = setTimeout(() => {
             setIsOpen(false);
             // When auto-closing, we don't mark as read automatically so they keep the red badge
           }, 5000);
        }
        
        // Always update the ref so we only trigger on actual *new* unread items
        lastNotifCountRef.current = currentUnreadCount;
        
      } catch (error) {
        console.error('Error fetching admin notifications', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, []); // Remove isOpen dependency to prevent infinite loops

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    // If we're manually toggling, clear the auto-hide timeout so it doesn't close on us
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    setIsOpen(!isOpen);
    if (!isOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      api.put('/admin-notifications/read').catch(err => console.error(err));
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-bounce shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -right-[260px] mt-4 w-[650px] bg-[#004741] border border-white/20 shadow-2xl rounded-2xl overflow-hidden z-50">
          <div className="bg-black/20 border-b border-white/10 p-4 flex justify-between items-center">
            <h3 className="font-black text-white text-sm uppercase tracking-widest">Notifikasi</h3>
            <span className="text-[10px] bg-[#16D84E]/20 text-[#16D84E] px-2 py-1 rounded-lg font-bold">
              {notifications.length} Pesan
            </span>
          </div>
          
          <div className="max-h-64 overflow-y-auto custom-scrollbar-dark">
            {notifications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {notifications.slice(0, 2).map(notif => (
                  <div key={notif.id} className={`p-3 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/10' : ''}`}>
                    <p className="text-xs text-white/80 leading-relaxed font-medium flex items-center justify-between">
                      <span className="truncate flex-1">
                        <span className="text-[#16D84E] font-bold">{notif.groupCode || 'Group'}</span> berada di hole <span className="text-emerald-400 font-bold">{notif.changedHole + 1 > 18 ? 1 : notif.changedHole + 1}</span> telah melakukan permainan di hole <span className="text-purple-400 font-bold">{notif.changedHole}</span>.
                      </span>
                      <span className="inline-flex gap-2 items-center ml-4 shrink-0">
                        {!notif.isApproved && !notif.isMarshalEdit && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded border border-rose-500/30 font-bold whitespace-nowrap">
                            Belum sepengetahuan pemain
                          </span>
                        )}
                        {notif.isApproved && !notif.isMarshalEdit && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 font-bold whitespace-nowrap">
                            Atas persetujuan pemain
                          </span>
                        )}
                        <span className="text-[10px] text-white/40 font-bold ml-2">
                          {formatTime(notif.time)}
                        </span>
                      </span>
                    </p>
                  </div>
                ))}
                {notifications.length > 2 && (
                  <div className="p-3 text-center bg-black/20 text-[10px] text-white/50 font-bold uppercase tracking-widest border-t border-white/10">
                    + {notifications.length - 2} Notifikasi Lainnya
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-white/40">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Belum ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNotifications;
