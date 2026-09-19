import { Search, Calendar, Mail, User } from 'lucide-react';

const MessageHistory = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Message History
        </h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Search Customer</label>
          <div className="relative">
            <input type="text" placeholder="Name / Phone" className="bg-gray-100 text-sm border-none rounded-lg px-10 py-2 outline-none w-full" />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Message Type</label>
          <select className="bg-gray-100 text-sm border-none rounded-lg px-3 py-2 outline-none w-full appearance-none">
            <option>All Types</option>
            <option>Promotion</option>
            <option>Notification</option>
            <option>System</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Date</label>
          <input type="date" className="bg-gray-100 text-sm border-none rounded-lg px-3 py-2 outline-none w-full" />
        </div>
        <button className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors">
          Filter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary text-white text-sm">
              <tr>
                <th className="p-4 font-semibold">Sent Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Message Content</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { date: '2026-03-31 10:30', name: 'Budi Santoso', type: 'Promotion', content: 'Special discount 20% for your next round!', status: 'Delivered' },
                { date: '2026-03-30 14:15', name: 'Siti Aminah', type: 'Notification', content: 'Your round at Palm Springs is confirmed.', status: 'Read' },
                { date: '2026-03-29 09:00', name: 'John Doe', type: 'System', content: 'Welcome to Golfinityscore membership!', status: 'Delivered' },
                { date: '2026-03-28 16:45', name: 'Jane Smith', type: 'Promotion', content: 'Join our weekend tournament now!', status: 'Failed' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 text-sm">
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {row.date}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-bold">{row.type}</span>
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {row.content}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      row.status === 'Read' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MessageHistory;
