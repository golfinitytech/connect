import React, { useState, useEffect } from 'react';
import { Search, User, X, Check } from 'lucide-react';

interface Customer {
  no: number;
  name: string;
  contact: string;
  gender: string;
}

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

const CustomerSelectionModal = ({ isOpen, onClose, onSelect }: CustomerSelectionModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState('Palm Springs Karawang');

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('golf_customers_master');
      if (saved) {
        setCustomers(JSON.parse(saved));
      }

      // Determine location name based on URL path
      const path = window.location.pathname;
      if (path.includes('userpadanggolfsulaiman')) {
        setLocationName('Padang Golf Sulaiman');
      } else if (path.includes('userjatinangorgolf')) {
        setLocationName('Jatinangor National Golf');
      } else {
        setLocationName('Palm Springs Karawang');
      }
    }
  }, [isOpen]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.contact.includes(searchQuery)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pilih Pelanggan</h2>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-tight">{locationName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Cari nama atau nomor handphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div 
                key={customer.no}
                onClick={() => {
                  onSelect(customer);
                  onClose();
                }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{customer.contact}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                  {customer.gender === 'M' ? 'Male' : 'Female'}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">Pelanggan tidak ditemukan</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Total {customers.length} Pelanggan Terdaftar
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSelectionModal;
