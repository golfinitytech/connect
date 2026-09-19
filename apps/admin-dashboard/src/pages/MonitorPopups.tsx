import { useState, useEffect } from 'react';
import { Monitor, Plus, Edit2, Trash2, Eye, X } from 'lucide-react';

const MonitorPopups = () => {
  const [popups, setPopups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Image', status: 'Active', displayTime: '5s' });

  useEffect(() => {
    const saved = localStorage.getItem('golf_monitor_popups');
    if (saved) {
      setPopups(JSON.parse(saved));
    } else {
      const defaults = [
        { id: 1, name: 'Welcome Banner', type: 'Image', status: 'Active', displayTime: '5s' },
        { id: 2, name: 'Weather Alert', type: 'Text', status: 'Inactive', displayTime: '10s' },
        { id: 3, name: 'Special Promotion', type: 'Video', status: 'Active', displayTime: '15s' },
      ];
      setPopups(defaults);
      localStorage.setItem('golf_monitor_popups', JSON.stringify(defaults));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editingPopup) {
      updated = popups.map(p => p.id === editingPopup.id ? { ...formData, id: p.id } : p);
    } else {
      updated = [...popups, { ...formData, id: Date.now() }];
    }
    setPopups(updated);
    localStorage.setItem('golf_monitor_popups', JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingPopup(null);
    setFormData({ name: '', type: 'Image', status: 'Active', displayTime: '5s' });
  };

  const deletePopup = (id: number) => {
    if (window.confirm('Delete this pop-up?')) {
      const updated = popups.filter(p => p.id !== id);
      setPopups(updated);
      localStorage.setItem('golf_monitor_popups', JSON.stringify(updated));
    }
  };

  const openEdit = (popup: any) => {
    setEditingPopup(popup);
    setFormData({ name: popup.name, type: popup.type, status: popup.status, displayTime: popup.displayTime });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Monitor Pop-up Management
        </h2>
        <button 
          onClick={() => {
            setEditingPopup(null);
            setFormData({ name: '', type: 'Image', status: 'Active', displayTime: '5s' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Create New Pop-up
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingPopup ? 'Edit Pop-up' : 'New Pop-up'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pop-up Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none"
                  >
                    <option>Image</option>
                    <option>Text</option>
                    <option>Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Time</label>
                  <input 
                    type="text" 
                    value={formData.displayTime}
                    onChange={e => setFormData({...formData, displayTime: e.target.value})}
                    placeholder="e.g. 5s"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.status === 'Active'} onChange={() => setFormData({...formData, status: 'Active'})} />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.status === 'Inactive'} onChange={() => setFormData({...formData, status: 'Inactive'})} />
                    Inactive
                  </label>
                </div>
              </div>
              <button className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                {editingPopup ? 'Update Pop-up' : 'Save Pop-up'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search pop-ups..." 
            className="w-full bg-gray-100 border-none rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs font-semibold text-gray-500 uppercase">
              <th className="p-4">Pop-up Name</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-center">Display Time</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {popups.map((popup) => (
              <tr key={popup.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Monitor size={18} />
                    </div>
                    <span className="font-bold text-gray-700">{popup.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{popup.type}</span>
                </td>
                <td className="p-4 text-center font-medium text-gray-600">{popup.displayTime}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    popup.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {popup.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(popup)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deletePopup(popup.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4 items-start">
        <div className="p-2 bg-blue-500 text-white rounded-lg">
          <Monitor size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-800 mb-1">Pop-up Configuration</h4>
          <p className="text-sm text-blue-600">
            Pop-ups will be displayed on all active golf cart monitors. You can schedule them or set them to appear based on specific triggers like entering a certain hole zone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonitorPopups;
