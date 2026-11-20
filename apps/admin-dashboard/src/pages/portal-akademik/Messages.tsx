import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Send } from 'lucide-react';
import {
  apiErrorMessage,
  fmtDate,
  fmtTime,
  getPortalUser,
  useContacts,
  useConversation,
  useSendMessage,
} from '../../services/academyApi';
import type { Contact } from '../../services/academyApi';
import { Avatar, QueryState } from './shared';

const ROLE_LABEL: Record<Contact['role'], string> = {
  coach: 'Pelatih',
  student: 'Murid',
  admin: 'Hub Admin',
};

const shortTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? fmtTime(d) : fmtDate(d);
};

const Messages = () => {
  const currentUser = getPortalUser();
  const [messageInput, setMessageInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contactsQ = useContacts();
  const contacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (contactsQ.data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q));
    // Most recent conversation first, then alphabetical.
    return list.sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta || a.name.localeCompare(b.name);
    });
  }, [contactsQ.data, search]);

  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) setSelectedContactId(contacts[0].id);
  }, [contacts, selectedContactId]);

  const activeContact = contacts.find((c) => c.id === selectedContactId) ?? contacts[0];
  const convQ = useConversation(activeContact?.id);
  const send = useSendMessage(activeContact?.id);
  const messages = convQ.data ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeContact?.id]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = messageInput.trim();
    if (!text || !activeContact) return;
    send.mutate(text, { onSuccess: () => setMessageInput('') });
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-12 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <QueryState
            isLoading={contactsQ.isLoading}
            error={contactsQ.error}
            isEmpty={!contactsQ.isLoading && !contactsQ.error && contacts.length === 0}
            emptyText="Belum ada kontak."
          />
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContactId(contact.id)}
              className={`p-4 rounded-[24px] cursor-pointer transition-all flex gap-3 ${
                contact.id === activeContact?.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Avatar name={contact.name} src={contact.avatarUrl} className="w-12 h-12 rounded-2xl text-sm !bg-[#004d40] !text-white" />
                {contact.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{contact.unread}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-gray-900 truncate">{contact.name}</h4>
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">
                    {contact.lastMessage ? shortTime(contact.lastMessage.createdAt) : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {contact.lastMessage?.text ?? ROLE_LABEL[contact.role]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
              <Avatar
                name={activeContact.name}
                src={activeContact.avatarUrl}
                className="w-12 h-12 rounded-2xl text-sm !bg-[#004d40] !text-white shadow-lg shadow-emerald-900/10"
              />
              <div>
                <h3 className="font-bold text-gray-900">{activeContact.name}</h3>
                <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
                  {ROLE_LABEL[activeContact.role]}
                  {activeContact.specialty ? ` • ${activeContact.specialty}` : ''}
                </p>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <QueryState
                isLoading={convQ.isLoading}
                error={convQ.error}
                isEmpty={!convQ.isLoading && !convQ.error && messages.length === 0}
                emptyText="Belum ada pesan. Mulai percakapan!"
              />
              {messages.map((msg, i) => {
                const isMe = msg.senderId === currentUser?.id;
                const day = new Date(msg.createdAt).toDateString();
                const showDay = i === 0 || new Date(messages[i - 1].createdAt).toDateString() !== day;
                return (
                  <React.Fragment key={msg.id}>
                    {showDay && (
                      <div className="flex justify-center">
                        <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                          {day === new Date().toDateString() ? 'Today' : fmtDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex gap-4 ${isMe ? 'justify-end' : ''}`}>
                      {!isMe && (
                        <Avatar
                          name={activeContact.name}
                          src={activeContact.avatarUrl}
                          className="w-8 h-8 rounded-xl text-xs !bg-[#004d40] !text-white"
                        />
                      )}
                      <div
                        className={`${
                          isMe
                            ? 'bg-[#004d40] text-white rounded-tr-none'
                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                        } p-4 rounded-[24px] shadow-sm max-w-md`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <span className={`text-[10px] mt-2 block font-medium ${isMe ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                          {fmtTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100">
              {send.isError && <p className="text-xs text-red-600 font-medium mb-2">{apiErrorMessage(send.error, 'Pesan gagal terkirim.')}</p>}
              <div className="flex items-center gap-4 bg-gray-50 rounded-[24px] p-2 pl-4">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none p-2"
                  value={messageInput}
                  maxLength={4000}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || send.isPending}
                  className="bg-[#004d40] text-white p-3 rounded-2xl hover:bg-[#003d33] transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 font-medium">
            Pilih kontak untuk mulai chat.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
