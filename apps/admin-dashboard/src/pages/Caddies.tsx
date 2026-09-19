import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Caddies = () => {
  const [caddies, setCaddies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCaddies = () => {
      const savedCaddies = localStorage.getItem('golf_caddies_master');
      if (savedCaddies) {
        let currentCaddies = JSON.parse(savedCaddies);
        // Auto-add 001 and 002 if missing for convenience
        const has001 = currentCaddies.some((c: any) => c.name === '001');
        if (!has001) {
          currentCaddies = [
            { id: '001', name: '001', searchedName: 'Siti Aminah', gender: 'F', contact: '08123456789', qualificationDate: '2025-01-01', cartNo: '1', tabletNo: 'T01', batteryNo: 'B01' },
            { id: '002', name: '002', searchedName: 'Budi Santoso', gender: 'M', contact: '08123456790', qualificationDate: '2025-01-02', cartNo: '2', tabletNo: 'T02', batteryNo: 'B02' },
            ...currentCaddies
          ];
          localStorage.setItem('golf_caddies_master', JSON.stringify(currentCaddies));
        }
        setCaddies(currentCaddies);
      } else {
        // Same default data as CaddieManage for consistency
        const defaultCaddies = [
          { id: '001', name: '001', searchedName: 'Siti Aminah', gender: 'F', contact: '08123456789', qualificationDate: '2025-01-01', cartNo: '1', tabletNo: 'T01', batteryNo: 'B01' },
          { id: '002', name: '002', searchedName: 'Budi Santoso', gender: 'M', contact: '08123456790', qualificationDate: '2025-01-02', cartNo: '2', tabletNo: 'T02', batteryNo: 'B02' },
          { id: '117', name: '117', searchedName: 'Agnes Virani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '146', name: '146', searchedName: 'Putri Rahma Aulia', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '106', name: '106', searchedName: 'Heni Apriani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '137', name: '137', searchedName: 'Fitka Fatmawati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '141', name: '141', searchedName: 'Chintya Rahmawati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '112', name: '112', searchedName: 'Rika Veronika', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '108', name: '108', searchedName: 'Kurnia', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '128', name: '128', searchedName: 'Aprianti', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '122', name: '122', searchedName: 'Hilda Dwi Ananda', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '120', name: '120', searchedName: 'Desi Mulyanti', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '148', name: '148', searchedName: 'Shika Silviana A', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '151', name: '151', searchedName: 'Devi Purnomo', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '133', name: '133', searchedName: 'Anuti Sri Rahayu', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '123', name: '123', searchedName: 'Miswati', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '121', name: '121', searchedName: 'Valeria Beku Nuamuri', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '145', name: '145', searchedName: 'Cahya Deshaningsih', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '131', name: '131', searchedName: 'Friska', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '104', name: '104', searchedName: 'Aura Adzania Berliantani', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
          { id: '129', name: '129', searchedName: 'Endah Wayanguri', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '0', batteryNo: '0' },
        ];
        setCaddies(defaultCaddies);
        localStorage.setItem('golf_caddies_master', JSON.stringify(defaultCaddies));
      }
    };

    loadCaddies();
    // Listen for changes from CaddieManage page
    window.addEventListener('storage', loadCaddies);
    window.addEventListener('caddieDataChanged', loadCaddies);
    return () => {
      window.removeEventListener('storage', loadCaddies);
      window.removeEventListener('caddieDataChanged', loadCaddies);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <h2 className="text-xl font-bold text-gray-800">All Caddies</h2>
        <div className="flex items-center gap-1 ml-2">
          <span className="bg-orange-400 text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
            Current Version: 21, <span className="text-[10px]">▲</span> 1
          </span>
          <button className="bg-green-600 text-white text-[11px] px-2 py-0.5 rounded hover:bg-green-700 transition-colors">
            Apply Monitor
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#f8f9fa] p-4 rounded border border-gray-200 flex items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="relative min-w-[120px]">
            <select className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none appearance-none cursor-pointer pr-10 focus:ring-1 focus:ring-primary/30">
              <option>Default</option>
              <option>Details</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-700">Name</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none w-48 focus:ring-1 focus:ring-primary/30" 
            />
          </div>
          <button className="bg-gray-600 text-white px-8 py-1.5 rounded text-sm font-bold hover:bg-gray-700 transition-colors">
            View
          </button>
        </div>
        <div className="ml-auto text-sm font-bold text-gray-700">
          Non-member Caddie : {caddies.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.searchedName.toLowerCase().includes(searchTerm.toLowerCase())
          ).length}
        </div>
      </div>

      {/* Stats and Table */}
      <div className="space-y-2">
        <div className="flex justify-end text-[11px] text-gray-600 font-medium mr-1">
          Employee : {caddies.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.searchedName.toLowerCase().includes(searchTerm.toLowerCase())
          ).length} person(s)
        </div>
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead className="bg-[#56b074] text-white">
                <tr>
                  <th className="border-r border-white/20 p-2 font-bold whitespace-nowrap">No <span className="text-[10px]">▲</span></th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[80px]">Name</th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[120px]">Searched Name</th>
                  <th className="border-r border-white/20 p-2 font-bold w-16">Gender</th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[120px]">Contact Info</th>
                  <th className="border-r border-white/20 p-2 font-bold w-20">Cart No.</th>
                  <th className="border-r border-white/20 p-2 font-bold w-20">Tablet No.</th>
                  <th className="border-r border-white/20 p-2 font-bold w-20">Battery No.</th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[100px]">Registration Date</th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[100px]">Termination Date</th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[120px]">Round History</th>
                  <th className="border-r border-white/20 p-2 font-bold min-w-[140px]">Member Recommendation</th>
                  <th className="p-2 font-bold min-w-[120px]">Snack Bar Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {caddies
                  .filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.searchedName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-gray-50 h-10">
                    <td className="border-r border-gray-100 p-2 text-gray-600">{i + 1}</td>
                    <td className="border-r border-gray-100 p-2 font-medium text-gray-800">{row.name}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-700">{row.searchedName}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.gender}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.contact}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.cartNo}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.tabletNo}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.batteryNo}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.regDate}</td>
                    <td className="border-r border-gray-100 p-2 text-gray-600">{row.termDate}</td>
                    <td className="border-r border-gray-100 p-2">
                      <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-[10px] font-medium transition-colors w-full">
                        Round History
                      </button>
                    </td>
                    <td className="border-r border-gray-100 p-2 text-center">
                      <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-[10px] font-medium transition-colors leading-tight">
                        Member<br/>Recommendation
                      </button>
                    </td>
                    <td className="p-2">
                      <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-[10px] font-medium transition-colors w-full">
                        Order History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caddies;

