import React, { useState } from 'react';
import { Target, CheckCircle2, Star, Users, Briefcase, Award, BookOpen, ChevronRight, Lock, Trophy, Circle, Package, MapPin, Eye, CreditCard, Check, User, Calendar, Clock, ChevronLeft } from 'lucide-react';

import coachAnaImg from '../../assets/ana-suhana.jpeg';
import coachAnangImg from '../../assets/anang-mulyanto.jpeg';
import coachApepImg from '../../assets/apep-benhur.jpeg';
import coachAtepImg from '../../assets/atep-suwarman.jpeg';
import coachItangImg from '../../assets/itang-saepudin.jpeg';
import coachJefrizalImg from '../../assets/jefrizal-sani.jpeg';
import coachSakimImg from '../../assets/sakim-mahara-budi.jpeg';
import coachUjiImg from '../../assets/uji-setiaji.jpeg';

const TrainingProgram = () => {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState('paket'); // paket, coach, venue, review, payment
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const coaches = [
    { id: 1, name: 'Ana Suhana', specialty: 'Senior Coach • Fundamentals', rating: 4.9, image: coachAnaImg },
    { id: 2, name: 'Anang Mulyanto', specialty: 'Head Coach • Advanced Swing', rating: 5.0, image: coachAnangImg },
    { id: 3, name: 'Apep Benhur', specialty: 'Pro Coach • Junior Specialist', rating: 4.8, image: coachApepImg },
    { id: 4, name: 'Atep Suwarman', specialty: 'Short Game Expert', rating: 4.7, image: coachAtepImg },
    { id: 5, name: 'Itang Saepudin', specialty: 'Mental & Strategy', rating: 4.9, image: coachItangImg },
    { id: 6, name: 'Jefrizal Sani', specialty: 'Technical Analyst', rating: 4.6, image: coachJefrizalImg },
    { id: 7, name: 'Sakim Mahara Budi', specialty: 'Physical Conditioning', rating: 4.9, image: coachSakimImg },
    { id: 8, name: 'Uji Setiaji', specialty: 'Tour Professional Coach', rating: 5.0, image: coachUjiImg },
  ];

  const venues = [
    { id: 1, name: 'Padang Golf Sulaiman', location: 'Bandung, Jawa Barat', rating: 4.8, image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Palm Springs Kerawang', location: 'Karawang, Jawa Barat', rating: 4.7, image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Jatinangor National Golf', location: 'Sumedang, Jawa Barat', rating: 4.9, image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=80&w=800' },
  ];

  const steps = [
    { id: 'paket', label: 'Paket', icon: <Package size={20} /> },
    { id: 'coach', label: 'Coach', icon: <User size={20} /> },
    { id: 'venue', label: 'Venue', icon: <MapPin size={20} /> },
    { id: 'review', label: 'Jadwal', icon: <Calendar size={20} /> },
    { id: 'payment', label: 'Selesai', icon: <CheckCircle2 size={20} /> },
  ];

  const handleSelectProgram = (program: any) => {
    setSelectedProgram(program);
    setIsBooking(true);
    setBookingStep('coach');
  };

  const handleBack = () => {
    if (bookingStep === 'coach') {
      setIsBooking(false);
      setBookingStep('paket');
      setSelectedCoach(null);
    } else if (bookingStep === 'venue') {
      setBookingStep('coach');
      setSelectedVenue(null);
    } else if (bookingStep === 'review') {
      setBookingStep('venue');
    }
  };

  const handleNext = () => {
    if (bookingStep === 'coach' && selectedCoach) {
      setBookingStep('venue');
    } else if (bookingStep === 'venue' && selectedVenue) {
      setBookingStep('review');
    } else if (bookingStep === 'review' && selectedDate && selectedTime) {
      setBookingStep('payment');
    }
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '19:00', '20:00'
  ];

  const availableDates = [
    { date: '2026-04-29', day: 'Wed', label: 'Besok' },
    { date: '2026-04-30', day: 'Thu', label: 'Kamis' },
    { date: '2026-05-01', day: 'Fri', label: 'Jumat' },
    { date: '2026-05-02', day: 'Sat', label: 'Sabtu' },
    { date: '2026-05-03', day: 'Sun', label: 'Minggu' },
    { date: '2026-05-04', day: 'Mon', label: 'Senin' },
    { date: '2026-05-05', day: 'Tue', label: 'Selasa' },
  ];

  const programs = [
    {
      id: 'level1',
      title: 'Level 1 - Beginner Program',
      tagline: 'Pondasi dasar teknik golf untuk pemula.',
      color: 'emerald',
      sublevels: [
        {
          name: 'Level 1a',
          sessions: [
            { name: 'Session 1 – Grip', status: 'completed' },
            { name: 'Session 2 – Posture', status: 'completed' },
            { name: 'Session 3 – Alignment', status: 'in-progress' },
            { name: 'Session 4 – Review & Drill', status: 'pending' },
          ],
          evaluation: 'Mid Level Evaluation',
          evalStatus: 'pending'
        },
        {
          name: 'Level 2a',
          sessions: [
            { name: 'Session 5 – Grip', status: 'locked' },
            { name: 'Session 6 – Posture', status: 'locked' },
            { name: 'Session 7 – Alignment', status: 'locked' },
            { name: 'Session 8 – Review & Drill', status: 'locked' },
          ],
          evaluation: 'Level 1 Evaluation',
          evalStatus: 'locked'
        }
      ]
    },
    {
      id: 'level2',
      title: 'Level 2',
      tagline: 'Materi akan segera tersedia.',
      color: 'blue'
    },
    {
      id: 'level3',
      title: 'Level 3',
      tagline: 'Materi akan segera tersedia.',
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isBooking ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Training Program</h1>
            <p className="text-gray-500 mt-1">Lacak progres latihan Anda dan pilih paket yang sesuai dengan tujuan Anda.</p>
          </div>

          <div className="space-y-12">
            {programs.map((program) => (
              <div key={program.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-${program.color}-50 flex items-center justify-center text-${program.color}-600 shadow-sm border border-${program.color}-100`}>
                    {program.id === 'level1' ? <Target size={24} /> : 
                     program.id === 'level2' ? <Award size={24} /> : <Star size={24} />}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
                </div>

                {program.sublevels ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {program.sublevels.map((sub, sIdx) => (
                        <div key={sIdx} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{sub.name}</h3>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              sub.sessions.every(s => s.status === 'locked') ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {sub.sessions.every(s => s.status === 'locked') ? 'Locked' : 'Active'}
                            </span>
                          </div>

                          <div className="flex-1 space-y-3">
                            {sub.sessions.map((session, sesIdx) => (
                              <div 
                                key={sesIdx} 
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                  session.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                                  session.status === 'in-progress' ? 'bg-white border-emerald-500 text-emerald-900 shadow-sm' :
                                  session.status === 'locked' ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-60' :
                                  'bg-white border-gray-100 text-gray-600'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {session.status === 'completed' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                                   session.status === 'locked' ? <Lock size={18} className="text-gray-300" /> :
                                   <Circle size={18} className={session.status === 'in-progress' ? 'text-emerald-500' : 'text-gray-300'} />}
                                  <span className="text-sm font-bold">{session.name}</span>
                                </div>
                                {session.status !== 'locked' && <ChevronRight size={16} className="text-gray-400" />}
                              </div>
                            ))}
                          </div>

                          <div className={`mt-8 p-4 rounded-2xl border border-dashed flex items-center justify-between ${
                            sub.evalStatus === 'locked' ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}>
                            <div className="flex items-center gap-3">
                              <Trophy size={18} className={sub.evalStatus === 'locked' ? 'text-gray-300' : 'text-amber-500'} />
                              <span className="text-sm font-bold">{sub.evaluation}</span>
                            </div>
                            {sub.evalStatus !== 'locked' && (
                              <button className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-all shadow-sm">
                                Start
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleSelectProgram(program)}
                      className="mt-8 w-full py-4 rounded-2xl font-bold text-white bg-[#004d40] hover:bg-[#003d33] transition-all shadow-lg shadow-emerald-100 hover:shadow-xl"
                    >
                      Pilih Paket Ini
                    </button>
                  </>
                ) : (
                  <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl bg-${program.color}-50 flex items-center justify-center text-${program.color}-600 shadow-inner`}>
                        <Lock size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                        <p className="text-gray-500 mt-1">{program.tagline}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectProgram(program)}
                      className={`mt-6 w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-${program.color}-100 hover:shadow-xl ${
                        program.id === 'level2' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
                      }`}
                    >
                      Pilih Paket Ini
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-12 max-w-6xl mx-auto pb-20">
          {/* Stepper */}
          <div className="relative pt-4">
            <div className="flex justify-between items-center relative z-10">
              {steps.map((step, index) => {
                const isCompleted = steps.findIndex(s => s.id === bookingStep) > index;
                const isActive = step.id === bookingStep;
                const isPending = steps.findIndex(s => s.id === bookingStep) < index;

                return (
                  <div key={step.id} className="flex flex-col items-center group flex-1 relative">
                    {/* Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-[2px] transition-all duration-500 ${
                        steps.findIndex(s => s.id === bookingStep) > index ? 'bg-emerald-500' : 'bg-gray-100'
                      }`} />
                    )}
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${
                      isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' :
                      isActive ? 'bg-white border-2 border-emerald-500 text-emerald-600 shadow-xl scale-110' :
                      'bg-white border-2 border-gray-100 text-gray-300'
                    }`}>
                      {isCompleted ? <Check size={20} /> : step.icon}
                    </div>
                    <span className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${
                      isActive ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {bookingStep === 'coach' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#004d40]">Pilih Coach</h2>
                  <p className="text-gray-500 mt-1">Pilih coach favorit Anda untuk mendampingi sesi latihan ini.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {coaches.map((coach) => (
                    <div 
                      key={coach.id} 
                      onClick={() => setSelectedCoach(coach)}
                      className={`bg-white rounded-[32px] p-6 border transition-all cursor-pointer group relative ${
                        selectedCoach?.id === coach.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl' : 'border-gray-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {selectedCoach?.id === coach.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center z-10 animate-in zoom-in">
                          <Check size={14} />
                        </div>
                      )}
                      <div className="w-full aspect-square rounded-2xl bg-gray-100 mb-4 overflow-hidden">
                        <img src={coach.image} alt={coach.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{coach.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{coach.specialty}</p>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold">{coach.rating}</span>
                        </div>
                        <span className={`text-xs font-bold transition-colors ${selectedCoach?.id === coach.id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`}>
                          {selectedCoach?.id === coach.id ? 'Terpilih' : 'Pilih Coach'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!selectedCoach}
                    className={`flex-[2] py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                      selectedCoach ? 'bg-[#86b19a] hover:bg-[#76a18a]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Lanjut Pilih Venue
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 'venue' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#004d40]">Pilih Venue</h2>
                  <p className="text-gray-500 mt-1">Pilih lokasi venue yang paling nyaman untuk Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {venues.map((venue) => (
                    <div 
                      key={venue.id} 
                      onClick={() => setSelectedVenue(venue)}
                      className={`bg-white rounded-[32px] p-6 border transition-all cursor-pointer group relative ${
                        selectedVenue?.id === venue.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl' : 'border-gray-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {selectedVenue?.id === venue.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center z-10 animate-in zoom-in">
                          <Check size={14} />
                        </div>
                      )}
                      <div className="w-full aspect-video rounded-2xl bg-gray-100 mb-4 overflow-hidden">
                        <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{venue.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-500" />
                        {venue.location}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold">{venue.rating}</span>
                        </div>
                        <span className={`text-xs font-bold transition-colors ${selectedVenue?.id === venue.id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`}>
                          {selectedVenue?.id === venue.id ? 'Terpilih' : 'Pilih Venue'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!selectedVenue}
                    className={`flex-[2] py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                      selectedVenue ? 'bg-[#86b19a] hover:bg-[#76a18a]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Lanjut Review
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 'review' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-[#004d40]">Pilih Jadwal Latihan</h2>
                  <p className="text-gray-500 mt-1">Sesuaikan waktu latihan Anda dengan ketersediaan {selectedCoach?.name}.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Side: Summary & Coach */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                      <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Briefcase size={18} /> Ringkasan Pilihan
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Paket</p>
                            <p className="text-sm font-bold text-gray-900">{selectedProgram?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white overflow-hidden shadow-sm">
                            <img src={selectedCoach?.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Coach</p>
                            <p className="text-sm font-bold text-gray-900">{selectedCoach?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Venue</p>
                            <p className="text-sm font-bold text-gray-900">{selectedVenue?.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Calendar & Time */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Date Selection */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600" /> Pilih Tanggal
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {availableDates.map((item) => (
                          <button
                            key={item.date}
                            onClick={() => setSelectedDate(item.date)}
                            className={`flex-shrink-0 w-20 py-4 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                              selectedDate === item.date
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/30'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{item.day}</span>
                            <span className="text-xl font-bold">{item.date.split('-')[2]}</span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={18} className="text-emerald-600" /> Pilih Waktu
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                              selectedTime === time
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={20} /> Kembali
                  </button>
                  <button 
                        onClick={handleNext}
                        disabled={!selectedDate || !selectedTime}
                        className={`flex-[2] py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                          selectedDate && selectedTime ? 'bg-[#86b19a] hover:bg-[#76a18a]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Lanjut ke Selesai Booking <ChevronRight size={20} />
                      </button>
                </div>
              </div>
            )}

            {bookingStep === 'payment' && (
              <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-100">
                  <CheckCircle2 size={48} />
                </div>
                
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl font-extrabold text-gray-900">Booking Berhasil!</h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Sesi latihan Anda telah dijadwalkan. Kami telah mengirimkan detail konfirmasi ke email Anda.
                  </p>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl max-w-2xl w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package size={20} className="text-emerald-600" /> Detail Latihan
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paket Program</p>
                        <p className="font-bold text-gray-900">{selectedProgram?.title}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Coach Pendamping</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                            <img src={selectedCoach?.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="font-bold text-gray-900">{selectedCoach?.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lokasi Latihan</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={16} className="text-emerald-500" />
                          <p className="font-bold text-gray-900">{selectedVenue?.name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Waktu Latihan</p>
                        <div className="flex items-center gap-2 mt-1 text-emerald-600">
                          <Calendar size={16} />
                          <p className="font-bold">{selectedDate} • {selectedTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star size={18} />
                      </div>
                      <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        Harap datang 15 menit sebelum sesi dimulai untuk persiapan. Hubungi admin jika Anda perlu melakukan perubahan jadwal.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsBooking(false);
                    setBookingStep('paket');
                    setSelectedProgram(null);
                    setSelectedCoach(null);
                    setSelectedVenue(null);
                    setSelectedDate('');
                    setSelectedTime('');
                  }}
                  className="mt-12 px-12 py-4 bg-[#004d40] hover:bg-[#00382d] text-white rounded-2xl font-bold shadow-xl transition-all hover:scale-105"
                >
                  Kembali ke Program Saya
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingProgram;
