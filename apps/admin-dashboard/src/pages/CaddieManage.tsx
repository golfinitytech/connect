import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CaddieManage = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'edit'>('register');
  
  // State for Register Tab
  const [registerRows, setRegisterRows] = useState([
    { id: 1, name: '', searchedName: '', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '', batteryNo: '' },
  ]);

  // State for Edit/Delete Tab - Load from localStorage
  const [editRows, setEditRows] = useState<any[]>([]);

  useEffect(() => {
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
        window.dispatchEvent(new Event('caddieDataChanged'));
      }
      setEditRows(currentCaddies);
    } else {
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
      setEditRows(defaultCaddies);
      localStorage.setItem('golf_caddies_master', JSON.stringify(defaultCaddies));
    }
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewRow = () => {
    setRegisterRows([...registerRows, { id: Date.now(), name: '', searchedName: '', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '', batteryNo: '' }]);
  };

  const deleteRegisterRow = (id: number) => {
    setRegisterRows(registerRows.filter(row => row.id !== id));
  };

  const handleRegisterChange = (id: number, field: string, value: string) => {
    setRegisterRows(registerRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleEditChange = (id: string, field: string, value: string) => {
    const updated = editRows.map(row => row.id === id ? { ...row, [field]: value } : row);
    setEditRows(updated);
  };

  const saveEdit = (id: string) => {
    localStorage.setItem('golf_caddies_master', JSON.stringify(editRows));
    window.dispatchEvent(new Event('caddieDataChanged'));
    setEditingId(null);
    alert('Caddie data updated successfully!');
  };

  const deleteCaddie = (id: string) => {
    if (window.confirm('Are you sure you want to delete this caddie?')) {
      const updated = editRows.filter(row => row.id !== id);
      setEditRows(updated);
      localStorage.setItem('golf_caddies_master', JSON.stringify(updated));
      window.dispatchEvent(new Event('caddieDataChanged'));
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('This will reset all caddie data to default values. Current changes will be lost. Proceed?')) {
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
      setEditRows(defaultCaddies);
      localStorage.setItem('golf_caddies_master', JSON.stringify(defaultCaddies));
      window.dispatchEvent(new Event('caddieDataChanged'));
      alert('Caddie data reset to defaults!');
    }
  };

  const confirmRegistration = () => {
    const validRows = registerRows.filter(row => row.name.trim() !== '');
    if (validRows.length === 0) {
      alert('Please fill in at least one caddie name.');
      return;
    }

    const updatedMaster = [...editRows, ...validRows.map(row => ({
      ...row,
      id: row.name // Using name as ID for consistency with existing data
    }))];

    setEditRows(updatedMaster);
    localStorage.setItem('golf_caddies_master', JSON.stringify(updatedMaster));
    window.dispatchEvent(new Event('caddieDataChanged'));
    setRegisterRows([{ id: Date.now(), name: '', searchedName: '', gender: 'F', contact: '', qualificationDate: '', cartNo: '', tabletNo: '', batteryNo: '' }]);
    alert(`${validRows.length} caddie(s) registered successfully!`);
  };

  return (
    <div className="space-y-4">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <h2 className="text-xl font-bold text-gray-800">Register/Edit Caddie</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center">
        <button 
          onClick={() => setActiveTab('register')}
          className={`px-12 py-2 rounded-t-lg font-bold text-sm transition-colors border-x border-t ${
            activeTab === 'register' 
              ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' 
              : 'bg-[#d1d5db] text-gray-600 border-gray-300'
          }`}
        >
          Register Caddie
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`px-12 py-2 rounded-t-lg font-bold text-sm transition-colors border-x border-t -ml-px ${
            activeTab === 'edit' 
              ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' 
              : 'bg-[#d1d5db] text-gray-600 border-gray-300'
          }`}
        >
          Edit/Delete Caddie
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#48bb78] text-white">
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[150px]">Name</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[150px]">Searched Name</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[100px]">Gender</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[150px]">Contact Info</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[150px]">Date of qualification</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[100px]">Cart No.</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[80px]">Tablet No.</th>
              <th className="px-3 py-2 text-xs font-bold border-r border-white/20 min-w-[80px]">Battery No.</th>
              <th className="px-3 py-2 text-xs font-bold min-w-[80px]">{activeTab === 'register' ? 'Function' : 'Select'}</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'register' ? (
              // Register Tab Rows
              registerRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <input 
                      type="text" 
                      value={row.name}
                      onChange={(e) => handleRegisterChange(row.id, 'name', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                    />
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <input 
                      type="text" 
                      value={row.searchedName}
                      onChange={(e) => handleRegisterChange(row.id, 'searchedName', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                    />
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <div className="flex items-center justify-center gap-3 text-[10px]">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`gender-${row.id}`} 
                          checked={row.gender === 'F'} 
                          onChange={() => handleRegisterChange(row.id, 'gender', 'F')}
                          className="w-3 h-3 text-[#48bb78] focus:ring-0" 
                        />
                        F
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`gender-${row.id}`} 
                          checked={row.gender === 'M'} 
                          onChange={() => handleRegisterChange(row.id, 'gender', 'M')}
                          className="w-3 h-3 text-[#48bb78] focus:ring-0" 
                        />
                        M
                      </label>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <input 
                      type="text" 
                      value={row.contact}
                      onChange={(e) => handleRegisterChange(row.id, 'contact', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                    />
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <div className="relative">
                      <input 
                        type="date" 
                        value={row.qualificationDate}
                        onChange={(e) => handleRegisterChange(row.id, 'qualificationDate', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78] appearance-none" 
                      />
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <div className="relative">
                      <select 
                        value={row.cartNo}
                        onChange={(e) => handleRegisterChange(row.id, 'cartNo', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none appearance-none pr-6 focus:border-[#48bb78]"
                      >
                        <option value=""></option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <input 
                      type="text" 
                      value={row.tabletNo}
                      onChange={(e) => handleRegisterChange(row.id, 'tabletNo', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                    />
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <input 
                      type="text" 
                      value={row.batteryNo}
                      onChange={(e) => handleRegisterChange(row.id, 'batteryNo', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button 
                      onClick={() => deleteRegisterRow(row.id)}
                      className="text-xs border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Edit/Delete Tab Rows
              editRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors h-9">
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={row.name}
                        onChange={(e) => handleEditChange(row.id, 'name', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                      />
                    ) : row.name}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={row.searchedName}
                        onChange={(e) => handleEditChange(row.id, 'searchedName', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                      />
                    ) : row.searchedName}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700 text-center italic font-medium">
                    {editingId === row.id ? (
                      <div className="flex items-center justify-center gap-3 text-[10px] italic">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`edit-gender-${row.id}`} 
                            checked={row.gender === 'F'} 
                            onChange={() => handleEditChange(row.id, 'gender', 'F')}
                            className="w-3 h-3 text-[#48bb78] focus:ring-0" 
                          />
                          F
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`edit-gender-${row.id}`} 
                            checked={row.gender === 'M'} 
                            onChange={() => handleEditChange(row.id, 'gender', 'M')}
                            className="w-3 h-3 text-[#48bb78] focus:ring-0" 
                          />
                          M
                        </label>
                      </div>
                    ) : row.gender}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={row.contact}
                        onChange={(e) => handleEditChange(row.id, 'contact', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                      />
                    ) : row.contact}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700">
                    {editingId === row.id ? (
                      <input 
                        type="date" 
                        value={row.qualificationDate}
                        onChange={(e) => handleEditChange(row.id, 'qualificationDate', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                      />
                    ) : row.qualificationDate}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700 text-center">
                    {editingId === row.id ? (
                      <div className="relative">
                        <select 
                          value={row.cartNo}
                          onChange={(e) => handleEditChange(row.id, 'cartNo', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none appearance-none pr-6 focus:border-[#48bb78]"
                        >
                          <option value=""></option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    ) : row.cartNo}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700 text-center">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={row.tabletNo}
                        onChange={(e) => handleEditChange(row.id, 'tabletNo', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                      />
                    ) : row.tabletNo}
                  </td>
                  <td className="px-3 py-1 border-r border-gray-100 text-xs text-gray-700 text-center">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={row.batteryNo}
                        onChange={(e) => handleEditChange(row.id, 'batteryNo', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#48bb78]" 
                      />
                    ) : row.batteryNo}
                  </td>
                  <td className="px-3 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === row.id ? (
                        <>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-[11px] text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => saveEdit(row.id)}
                            className="bg-[#48bb78] text-white text-[11px] font-bold px-3 py-1 rounded hover:bg-[#38a169] transition-colors"
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => deleteCaddie(row.id)}
                            className="bg-[#e53e3e] text-white text-[11px] font-bold px-3 py-1 rounded hover:bg-[#c53030] transition-colors"
                          >
                            Delete
                          </button>
                          <button 
                            onClick={() => setEditingId(row.id)}
                            className="bg-[#3182ce] text-white text-[11px] font-bold px-3 py-1 rounded hover:bg-[#2b6cb0] transition-colors"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2">
        {activeTab === 'edit' && (
          <button 
            onClick={resetToDefaults}
            className="bg-rose-600 text-white px-6 py-2 rounded text-xs font-bold hover:bg-rose-700 transition-colors mr-auto"
          >
            Reset to Default Data
          </button>
        )}
        {activeTab === 'register' && (
          <>
            <button 
              onClick={addNewRow}
              className="bg-[#4a4a4a] text-white px-6 py-2 rounded text-xs font-bold hover:bg-[#333333] transition-colors"
            >
              Add New Row
            </button>
            <button 
              onClick={confirmRegistration}
              className="bg-[#4a4a4a] text-white px-8 py-2 rounded text-xs font-bold hover:bg-[#333333] transition-colors"
            >
              Confirm
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CaddieManage;
