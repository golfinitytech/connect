import { TrendingUp, Award, Clock, Star } from 'lucide-react';

const CaddiePerformance = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Caddie Performance
        </h2>
        <div className="flex gap-2">
          <select className="bg-white border rounded-lg px-4 py-2 text-sm outline-none text-slate-700">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Rounds', value: '1,240', icon: TrendingUp, color: 'bg-blue-500' },
          { label: 'Avg Rating', value: '4.8', icon: Star, color: 'bg-orange-500' },
          { label: 'Working Hours', value: '3,420h', icon: Clock, color: 'bg-purple-500' },
          { label: 'Top Performer', value: 'NANA', icon: Award, color: 'bg-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Top 5 Performers</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Caddie</th>
                <th className="p-4 text-center">Rounds</th>
                <th className="p-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {[
                { rank: 1, name: 'NANA', rounds: 45, rating: 4.9 },
                { rank: 2, name: 'SITI', rounds: 42, rating: 4.8 },
                { rank: 3, name: 'ANI', rounds: 40, rating: 4.8 },
                { rank: 4, name: 'BUDI', rounds: 38, rating: 4.7 },
                { rank: 5, name: 'JOKO', rounds: 35, rating: 4.7 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors text-slate-700">
                  <td className="p-4 font-bold text-gray-500">#{row.rank}</td>
                  <td className="p-4 font-medium">{row.name}</td>
                  <td className="p-4 text-center">{row.rounds}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 font-bold">
                      <Star size={14} fill="currentColor" />
                      {row.rating}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-gray-700">Rounds Distribution</h3>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Chart will be integrated here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaddiePerformance;
