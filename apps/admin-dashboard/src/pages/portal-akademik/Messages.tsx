import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, Phone, Video, Info, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { studentAccounts, coachAccounts } from '../../data/authData';
import coachAnaImg from '../../assets/ana-suhana.jpeg';
import coachAnangImg from '../../assets/anang-mulyanto.jpeg';
import coachApepImg from '../../assets/apep-benhur.jpeg';
import coachAtepImg from '../../assets/atep-suwarman.jpeg';
import coachItangImg from '../../assets/itang-saepudin.jpeg';
import coachJefrizalImg from '../../assets/jefrizal-sani.jpeg';
import coachSakimImg from '../../assets/sakim-mahara-budi.jpeg';
import coachUjiImg from '../../assets/uji-setiaji.jpeg';

const coachImages: Record<string, any> = {
  'Ana Suhana': coachAnaImg,
  'Anang Mulyanto': coachAnangImg,
  'Apep Benhur': coachApepImg,
  'Atep Suwarman': coachAtepImg,
  'Itang Saepudin': coachItangImg,
  'Jefrizal Sani': coachJefrizalImg,
  'Sakim Mahara Budi': coachSakimImg,
  'Uji Setiaji': coachUjiImg
};

const Messages = () => {
  const location = useLocation();
  const isCoach = location.pathname.includes('/coach/');
  const isStudent = location.pathname.includes('/student/');

  const storedUser = localStorage.getItem('portalUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [messageInput, setMessageInput] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<number | string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get conversation ID
  const getConversationId = (contactId: number | string) => {
    if (!currentUser) return '';
    const ids = [currentUser.id, contactId].sort();
    return `chat_${ids[0]}_${ids[1]}`;
  };

  const getLatestChatInfo = (contactId: number | string) => {
    const convId = getConversationId(contactId);
    const saved = localStorage.getItem(convId);
    if (saved) {
      const msgs = JSON.parse(saved);
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        return { lastMsg: last.text, time: last.time };
      }
    }
    return null;
  };

  const contacts = useMemo(() => {
    let list: any[] = [];

    if (isStudent && currentUser) {
      // Logic to determine coach based on login (same as in StudentDashboard)
      let assignedCoachName = 'Ana Suhana'; // Default
      if (['Regi', 'Hadi', 'Fakih', 'Ridho'].includes(currentUser.name)) {
        assignedCoachName = 'Anang Mulyanto';
      } else if (currentUser.name === 'John Doe') {
        assignedCoachName = 'Apep Benhur';
      }

      const assignedCoach = coachAccounts.find(c => c.name === assignedCoachName) || coachAccounts[0];

      list = [
        { 
          id: assignedCoach.id, 
          name: assignedCoach.name, 
          role: 'Pelatih Anda', 
          image: coachImages[assignedCoach.name], 
          lastMsg: getLatestChatInfo(assignedCoach.id)?.lastMsg || "Don't forget to practice your grip today!", 
          time: getLatestChatInfo(assignedCoach.id)?.time || '10:30 AM', 
          unread: 2
        },
        { 
          id: 999, 
          name: 'Hub Support', 
          role: 'Bantuan Hub', 
          image: undefined, 
          lastMsg: getLatestChatInfo(999)?.lastMsg || 'Halo, ada yang bisa kami bantu?', 
          time: getLatestChatInfo(999)?.time || 'Yesterday', 
          unread: 0
        }
      ];
    } else if (isCoach && currentUser) {
      // For coach, show their students
      // Coach Anang has Regi, Hadi, Fakih, Ridho
      let myStudents = studentAccounts;
      if (currentUser.name === 'Anang Mulyanto') {
        myStudents = studentAccounts.filter(s => ['Regi', 'Hadi', 'Fakih', 'Ridho'].includes(s.name));
      } else if (currentUser.name === 'Apep Benhur') {
        myStudents = studentAccounts.filter(s => s.name === 'John Doe');
      }

      list = myStudents.map((s, idx) => {
        const chatInfo = getLatestChatInfo(s.id);
        return {
          id: s.id,
          name: s.name,
          role: 'Murid • Level 1',
          image: undefined,
          lastMsg: chatInfo?.lastMsg || "Thanks Coach! I'll keep practicing.",
          time: chatInfo?.time || (idx === 0 ? '10:28 AM' : 'Yesterday'),
          unread: idx === 1 ? 1 : 0
        };
      });

      if (list.length === 0) {
        list = [{ id: 0, name: 'Belum ada murid', role: '', lastMsg: '', time: '', unread: 0 }];
      }
    } else {
      // Default / Admin fallback
      list = [
        { id: 1, name: 'Support System', role: 'System', lastMsg: 'Welcome to Messages', time: 'Now', unread: 0 }
      ];
    }
    return list;
   }, [isStudent, isCoach, currentUser, messages]);

  // Update messages when contact changes
  useEffect(() => {
    if (selectedContactId) {
      const convId = getConversationId(selectedContactId);
      const savedMessages = localStorage.getItem(convId);
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        const contact = contacts.find(c => c.id === selectedContactId);
        if (contact) {
          const defaultMsgs = [
            { id: 1, sender: 'other', senderId: contact.id, text: isCoach ? `Hi Coach! This is ${contact.name}. I've been practicing my swing.` : `Hi ${currentUser?.name}! Great session today.`, time: '10:15 AM' },
            { id: 2, sender: 'me', senderId: currentUser?.id, text: isCoach ? `Excellent, ${contact.name}! Keep focusing on the grip.` : "Thanks Coach! I'll keep practicing.", time: '10:20 AM' },
            { id: 3, sender: 'other', senderId: contact.id, text: "I'll do my best! 🏌️‍♂️", time: '10:30 AM' },
          ];
          setMessages(defaultMsgs);
          localStorage.setItem(convId, JSON.stringify(defaultMsgs));
        }
      }
    }
  }, [selectedContactId, isCoach, currentUser, contacts]);

  // Set default selected contact if none selected
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  const activeContact = useMemo(() => contacts.find(c => c.id === selectedContactId) || contacts[0], [contacts, selectedContactId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedContactId || !currentUser) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      senderId: currentUser.id,
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save to localStorage for persistence across accounts
    const convId = getConversationId(selectedContactId);
    localStorage.setItem(convId, JSON.stringify(updatedMessages));
    
    setMessageInput('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 animate-in fade-in duration-500">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-12 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setSelectedContactId(contact.id)}
              className={`p-4 rounded-[24px] cursor-pointer transition-all flex gap-3 ${
                contact.id === selectedContactId ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-[#004d40] flex items-center justify-center text-white font-bold overflow-hidden">
                  {contact.image ? (
                    <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                  ) : (
                    contact.name.split(' ').length > 1 ? contact.name.split(' ')[1].charAt(0) : contact.name.charAt(0)
                  )}
                </div>
                {contact.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{contact.unread}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 truncate">{contact.name}</h4>
                  <span className="text-[10px] font-bold text-gray-400">{contact.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{contact.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {/* Chat Header */}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#004d40] flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/10 overflow-hidden">
              {activeContact.image ? (
                <img src={activeContact.image} alt={activeContact.name} className="w-full h-full object-cover" />
              ) : (
                activeContact.name.split(' ').length > 1 ? activeContact.name.split(' ')[1].charAt(0) : activeContact.name.charAt(0)
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{activeContact.name}</h3>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><Phone size={20} /></button>
            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><Video size={20} /></button>
            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><Info size={20} /></button>
            <div className="w-px h-6 bg-gray-100 mx-2" />
            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="flex justify-center">
            <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">Today</span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? 'justify-end' : ''}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl bg-[#004d40] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                    {activeContact.image ? (
                      <img src={activeContact.image} alt={activeContact.name} className="w-full h-full object-cover" />
                    ) : (
                      activeContact.name.charAt(0)
                    )}
                  </div>
                )}
                <div className={`${
                  isMe 
                    ? 'bg-[#004d40] text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                } p-4 rounded-[24px] shadow-sm max-w-md`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className={`text-[10px] mt-2 block font-medium ${isMe ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSendMessage}
          className="p-6 bg-white border-t border-gray-100"
        >
          <div className="flex items-center gap-4 bg-gray-50 rounded-[24px] p-2 pl-4">
            <button type="button" className="p-2 text-gray-400 hover:text-emerald-500 transition-all"><Paperclip size={20} /></button>
            <input 
              type="text" 
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none p-2"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="button" className="p-2 text-gray-400 hover:text-emerald-500 transition-all"><Smile size={20} /></button>
            <button 
              type="submit"
              disabled={!messageInput.trim()}
              className="bg-[#004d40] text-white p-3 rounded-2xl hover:bg-[#003d33] transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;
