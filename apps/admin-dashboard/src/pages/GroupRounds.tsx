import { Search, Users, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

const GroupRounds = () => {
  const groups = [
    { id: 'GRP-001', name: 'Executive Morning', members: 4, startTime: '07:30', hole: 'Hole 1', progress: '3/18' },
    { id: 'GRP-002', name: 'Junior Tournament', members: 3, startTime: '08:15', hole: 'Hole 5', progress: '12/18' },
    { id: 'GRP-003', name: 'Weekend Social', members: 4, startTime: '09:00', hole: 'Hole 1', progress: '1/18' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Group Rounds Management
        </h2>
        <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          Create New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-primary/30 transition-all group">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
                <p className="text-xs text-gray-400 font-bold tracking-wider">{group.id}</p>
              </div>
              <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">
                IN PROGRESS
              </span>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Users size={16} />
                  <span>{group.members} Players</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span>Start: {group.startTime}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={16} />
                  <span>Current: {group.hole}</span>
                </div>
                <div className="font-bold text-primary">{group.progress} Holes</div>
              </div>

              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000" 
                  style={{ width: `${(parseInt(group.progress.split('/')[0]) / 18) * 100}%` }}
                ></div>
              </div>

              <button className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-primary transition-colors">
                View Details
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupRounds;
