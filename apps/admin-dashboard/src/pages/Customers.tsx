import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  LayoutGrid,
  List as ListIcon,
  User,
  MessageCircle,
  QrCode,
  Trash2,
  XCircle,
  Download,
  AlertCircle,
  Edit2,
  Upload
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const Customers = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [players, setPlayers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedPlayerForQR, setSelectedPlayerForQR] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // States for Edit Customer
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get('/tournaments/active');
        if (response.data) {
          // Add mock players from image if they don't exist
          const mockPlayers = [
            "Om Deriana", "Om ABBY", "Om BILY", "Om Krisnawan", "Om Irwan",
            "Om Willy", "Om Evan", "Mr. Liu", "Kakak DAVID", "Dylan",
            "Om Aseng Hendra", "Om Ari", "H. Ade", "Om Reza", "Om Qodri",
            "Om Adji P", "Om Luky", "Om Ikbal", "Om Efendi", "Om Budiman Djanwar",
            "Om Ferry Salim", "Om Dion", "Om Andreas", "Om Tigos", "Om Azwari",
            "Om Wilson", "Om Awong", "Om Rizky", "Om Adim", "Om Masno",
            "Om Dani J", "Om Ridwan", "Om Hasan", "Om Rahmadi", "Om Filman"
          ].map((name, idx) => ({
            id: `mock-${idx + 1}`,
            name: name,
            memberId: `GF-${2026000 + idx}`,
            handicap: Math.floor(Math.random() * 24) + 1,
            gender: name.includes('Kakak') ? 'F' : 'M',
            joinDate: new Date().toISOString()
          }));

          const apiPlayers = response.data.players || [];
          setPlayers([...apiPlayers, ...mockPlayers]);
          setGroups(response.data.groups || []);
          return;
        }
      } catch (error) {
        console.warn('API error or no active tournament in DB, falling back to localStorage:', error);
      }

      const savedData = localStorage.getItem('active_tournament');
      
      const mockPlayers = [
        "Om Deriana", "Om ABBY", "Om BILY", "Om Krisnawan", "Om Irwan",
        "Om Willy", "Om Evan", "Mr. Liu", "Kakak DAVID", "Dylan",
        "Om Aseng Hendra", "Om Ari", "H. Ade", "Om Reza", "Om Qodri",
        "Om Adji P", "Om Luky", "Om Ikbal", "Om Efendi", "Om Budiman Djanwar",
        "Om Ferry Salim", "Om Dion", "Om Andreas", "Om Tigos", "Om Azwari",
        "Om Wilson", "Om Awong", "Om Rizky", "Om Adim", "Om Masno",
        "Om Dani J", "Om Ridwan", "Om Hasan", "Om Rahmadi", "Om Filman"
      ].map((name, idx) => ({
        id: `mock-${idx + 1}`,
        name: name,
        memberId: `GF-${2026000 + idx}`,
        handicap: Math.floor(Math.random() * 24) + 1,
        gender: name.includes('Kakak') ? 'F' : 'M',
        joinDate: new Date().toISOString()
      }));

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setPlayers([...(parsedData.players || []), ...mockPlayers]);
        setGroups(parsedData.groups || []);
      } else {
        setPlayers(mockPlayers);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.handicap.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const currentPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPlayerCode = (playerId: number) => {
    for (const g of groups) {
      if (g.players?.some((p: any) => p.id === playerId)) {
        return g.code;
      }
    }
    return '';
  };

  const handleWhatsAppIndividual = (player: any) => {
    const phone = player.phone?.replace(/[^0-9]/g, '');
    if (!phone || phone.length < 10) {
      alert('Nomor telepon tidak valid.');
      return;
    }

    const playerCode = getPlayerCode(player.id);
    const message = `Halo *${player.name}*, berikut adalah informasi Anda:\n\nKode Akses Flight: *${playerCode || '-'}*\n\nTerima kasih!`;

    let formattedPhone = phone;
    if (phone.startsWith('0')) formattedPhone = '62' + phone.slice(1);
    else if (!phone.startsWith('62')) formattedPhone = '62' + phone;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEditClick = (player: any) => {
    setEditingPlayer({ ...player });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    // Update local state
    const updatedPlayers = players.map(p => p.id === editingPlayer.id ? editingPlayer : p);
    setPlayers(updatedPlayers);
    
    // Attempt to update localStorage if it was originally from there
    const savedData = localStorage.getItem('active_tournament');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // This is a naive update assuming all players exist in parsedData.players
        // For the mock players it won't persist past reload unless saved to backend
        parsedData.players = parsedData.players.map((p: any) => p.id === editingPlayer.id ? editingPlayer : p);
        localStorage.setItem('active_tournament', JSON.stringify(parsedData));
      } catch(e) {}
    }

    setIsEditModalOpen(false);
    setEditingPlayer(null);
  };

  const deletePlayer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const savedData = localStorage.getItem('active_tournament');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const updatedPlayers = parsedData.players.filter((p: any) => p.id !== id);
        
        const newData = { ...parsedData, players: updatedPlayers };
        
        if (newData.groups) {
          newData.groups = newData.groups.map((g: any) => ({
            ...g,
            players: g.players.filter((p: any) => p.id !== id)
          }));
        }

        localStorage.setItem('active_tournament', JSON.stringify(newData));
        setPlayers(updatedPlayers);
        setGroups(newData.groups || []);
      }
    }
  };

  const openQRModal = (player: any) => {
    const code = getPlayerCode(player.id);
    setSelectedPlayerForQR({ ...player, code });
    setIsQRModalOpen(true);
  };

  const downloadQR = (playerName: string) => {
    const canvas = document.getElementById('player-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${playerName.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    }
  };

  const downloadExcelTemplate = () => {
    const headers = ['Name', 'Handicap', 'DOB (YYYY-MM-DD)', 'Phone', 'Email', 'Shirt Size (S/M/L/XL/XXL)'];
    
    // Default sample data provided by user
    const samplePlayers = [
      "H. Ade,20,1985-01-14,08123456713,player13@example.com,M",
      "Om Reza,14,1985-01-15,08123456714,player14@example.com,L",
      "Om Qodri,18,1985-01-16,08123456715,player15@example.com,S",
      "Om Adji P,13,1985-01-17,08123456716,player16@example.com,L",
      "Om Luky,28,1985-01-18,08123456717,player17@example.com,XXL",
      "Om Ikbal,28,1985-01-19,08123456718,player18@example.com,S",
      "Om Efendi,28,1985-01-20,08123456719,player19@example.com,XXL",
      "Om Budiman Djanwar,28,1985-01-21,08123456720,player20@example.com,S",
      "Om Ferry Salim,26,1985-01-22,08123456721,player21@example.com,S",
      "Om Dion,26,1985-01-23,08123456722,player22@example.com,XL",
      "Om Andreas,24,1985-01-24,08123456723,player23@example.com,XXL",
      "Om Tigos,16,1985-01-25,08123456724,player24@example.com,L",
      "Om Azwari,15,1985-01-26,08123456725,player25@example.com,XXL",
      "Om Wilson,20,1985-01-27,08123456726,player26@example.com,L",
      "Om Awong,14,1985-01-28,08123456727,player27@example.com,XL",
      "Om Rizky,28,1985-01-01,08123456728,player28@example.com,M",
      "Om Adim,21,1985-01-02,08123456729,player29@example.com,XXL",
      "Om Masno,19,1985-01-03,08123456730,player30@example.com,L",
      "Om Dani J,16,1985-01-04,08123456731,player31@example.com,L",
      "Om Ridwan,28,1985-01-05,08123456732,player32@example.com,XL",
      "Om Hasan,16,1985-01-06,08123456733,player33@example.com,XL",
      "Om Rahmadi,8,1985-01-07,08123456734,player34@example.com,M",
      "Om Filman,20,1985-01-08,08123456735,player35@example.com,XXL"
    ];

    const csvContent = [
      headers.join(','),
      ...samplePlayers
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newPlayers: any[] = [];
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, handicap, dob, phone, email, shirtSize] = line.split(',');
        if (name) {
          const hcpVal = parseInt(handicap?.trim() || '0');
          let assignedFlight = 'A';
          if (hcpVal >= 14 && hcpVal <= 21) assignedFlight = 'B';
          else if (hcpVal >= 22) assignedFlight = 'C';

          newPlayers.push({
            id: `imported-${Date.now()}-${i}`,
            name: name.trim(),
            handicap: hcpVal.toString(),
            dob: dob?.trim() || '',
            phone: phone?.trim() || '',
            email: email?.trim() || '',
            shirtSize: shirtSize?.trim() || 'L',
            flight: assignedFlight,
            memberId: `GF-${2026000 + Math.floor(Math.random() * 1000)}`,
            gender: 'M', // Defaulting to M for import
            joinDate: new Date().toISOString()
          });
        }
      }

      if (newPlayers.length > 0) {
        setPlayers(prev => [...newPlayers, ...prev]);
        
        // Try to update local storage
        const savedData = localStorage.getItem('active_tournament');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            parsedData.players = [...newPlayers, ...(parsedData.players || [])];
            localStorage.setItem('active_tournament', JSON.stringify(parsedData));
          } catch(err) {}
        }
        
        alert(`Successfully imported ${newPlayers.length} customers!`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800 uppercase italic tracking-tight">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users className="text-blue-600" size={28} />
              </div>
              Customers List
            </h1>
            <p className="text-slate-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em] ml-1">
              All registered players
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all w-72 text-sm font-bold text-slate-700"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>

            <div className="h-10 w-px bg-slate-200 mx-2" />

            <button 
              onClick={downloadExcelTemplate}
              className="bg-white hover:bg-slate-50 text-slate-600 p-3 rounded-2xl transition-all active:scale-95 group relative border border-slate-200 shadow-sm"
              title="Download Template Excel"
            >
              <Download size={20} />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv" 
              className="hidden" 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 group shadow-xl shadow-blue-600/20"
              title="Import Data Excel"
            >
              <Upload size={18} />
              <span className="text-xs font-black uppercase tracking-widest hidden lg:block">Import CSV</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {filteredPlayers.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentPlayers.map((player: any) => (
                  <div key={player.id} className="bg-white border border-slate-200 rounded-[32px] p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/5 transition-all group relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <User size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">HCP {player.handicap}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 mt-2">
                          <button 
                            onClick={() => openQRModal(player)}
                            className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all p-2 rounded-lg border border-slate-200 shadow-sm"
                            title="View QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                          <button 
                              onClick={() => handleEditClick(player)}
                              className="bg-white text-amber-500 hover:bg-amber-500 hover:text-white transition-all p-2 rounded-lg border border-slate-200 shadow-sm"
                              title="Edit Customer"
                            >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleWhatsAppIndividual(player)}
                            className="bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all p-2 rounded-lg border border-slate-200 shadow-sm"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button 
                            onClick={() => deletePlayer(player.id)}
                            className="bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all p-2 rounded-lg border border-slate-200 shadow-sm"
                            title="Delete Customer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mb-1">
                      <h3 className="font-black text-base text-slate-800 truncate uppercase italic tracking-tight">{player.name || 'Unnamed Customer'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{player.email || 'no-email@example.com'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Shirt</span>
                          <span className="text-xs font-black text-slate-600">{player.shirtSize}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{player.phone || '-'}</span>
                        <span className="text-[9px] font-bold text-slate-400 italic">Flight {player.flight || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5">Customer Name</th>
                        <th className="px-8 py-5 text-center">HCP</th>
                        <th className="px-8 py-5 text-center">Flight</th>
                        <th className="px-8 py-5">Contact Info</th>
                        <th className="px-8 py-5 text-center">Shirt</th>
                        <th className="px-8 py-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {currentPlayers.map((player: any) => (
                        <tr key={player.id} className="hover:bg-slate-50/50 transition-colors cursor-default group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => openQRModal(player)}
                                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm group-hover:border-blue-200"
                                title="View QR Code"
                              >
                                <QrCode size={18} />
                              </button>
                              <div>
                                <span className="font-black text-slate-800 uppercase italic tracking-tight block">{player.name || 'Unnamed Customer'}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{player.email || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">HCP {player.handicap}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">{player.flight || '-'}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200">{player.phone || '-'}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest">{player.shirtSize}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                  onClick={() => handleEditClick(player)}
                                  className="text-amber-500 hover:bg-amber-50 p-2.5 rounded-xl transition-all active:scale-90 border border-transparent hover:border-amber-100"
                                  title="Edit Customer"
                                >
                                <Edit2 size={20} />
                              </button>
                              <button 
                                onClick={() => handleWhatsAppIndividual(player)}
                                className="text-emerald-600 hover:bg-emerald-50 p-2.5 rounded-xl transition-all active:scale-90 border border-transparent hover:border-emerald-100"
                                title="WhatsApp Customer"
                              >
                                <MessageCircle size={20} />
                              </button>
                              <button 
                                onClick={() => deletePlayer(player.id)}
                                className="text-slate-300 hover:text-rose-500 p-2.5 rounded-xl transition-all active:scale-90 border border-transparent hover:border-rose-100"
                                title="Delete Customer"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white border-transparent' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <AlertCircle size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter italic">No Customers Found</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Try adjusting your search or add players to the tournament</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {isQRModalOpen && selectedPlayerForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-slate-800">{selectedPlayerForQR.name}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedPlayerForQR.code || 'NO-CODE'}</p>
                </div>
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl mb-6 flex flex-col items-center border border-slate-100">
                <QRCodeCanvas 
                  id="player-qr-canvas"
                  value={selectedPlayerForQR.code || selectedPlayerForQR.id?.toString() || 'NO-CODE'} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan to start scoring</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => downloadQR(selectedPlayerForQR.name)}
                  className="py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPlayer(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
            >
              <XCircle size={24} />
            </button>
            
            <div className="text-center mb-6 mt-2">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Edit2 size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">Edit Customer</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingPlayer.name || ''}
                  onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Member ID</label>
                <input 
                  type="text" 
                  value={editingPlayer.memberId || ''}
                  onChange={(e) => setEditingPlayer({...editingPlayer, memberId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Handicap</label>
                  <input 
                    type="number" 
                    value={editingPlayer.handicap || 0}
                    onChange={(e) => setEditingPlayer({...editingPlayer, handicap: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                  <select 
                    value={editingPlayer.gender || 'M'}
                    onChange={(e) => setEditingPlayer({...editingPlayer, gender: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-700"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPlayer(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
