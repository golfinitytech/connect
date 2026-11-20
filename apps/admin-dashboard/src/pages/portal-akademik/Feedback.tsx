import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { apiErrorMessage, getPortalUser, useSendFeedback } from '../../services/academyApi';

const CATEGORIES = ['Training Program', 'App Performance', 'Facility', 'Coaching', 'Other'];

const Feedback = () => {
  const navigate = useNavigate();
  const send = useSendFeedback();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    send.mutate(
      { rating, category, message },
      {
        onSuccess: () => {
          setSent(true);
          setRating(0);
          setMessage('');
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-500 mt-1">We value your thoughts. Help us improve your experience.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Send us your feedback</h3>
        
        {sent && (
          <div className="mb-6 flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
            <CheckCircle2 size={18} /> Terima kasih! Feedback Anda sudah terkirim.
          </div>
        )}
        <form className="space-y-6" onSubmit={submit}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">How would you rate your experience?</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  aria-label={`${star} bintang`}
                  onClick={() => { setRating(star); setSent(false); }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center hover:text-yellow-400 hover:bg-yellow-50 transition-all ${star <= rating ? 'text-yellow-400 bg-yellow-50' : 'bg-gray-50 text-gray-300'}`}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Feedback Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Your Message</label>
            <textarea 
              rows={4}
              required
              minLength={3}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setSent(false); }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
              placeholder="Tell us what you think..."
            ></textarea>
          </div>

          {send.isError && <p className="text-sm font-medium text-red-600">{apiErrorMessage(send.error)}</p>}
          <button type="submit" disabled={!rating || send.isPending} className="disabled:opacity-50 w-full bg-[#004d40] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20">
            <Send size={20} />
            {send.isPending ? 'Mengirim...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      <div onClick={() => navigate(`/portalakademik/${getPortalUser()?.role ?? 'student'}/messages`)} className="cursor-pointer bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 flex items-center gap-6 max-w-2xl">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
          <MessageSquare size={32} />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900">Need immediate help?</h4>
          <p className="text-sm text-emerald-700 mt-1">Chat with our support team directly for any technical issues or scheduling conflicts.</p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
