import { Star, Search, Filter, MessageSquare } from 'lucide-react';

const CaddieRating = () => {
  const ratings = [
    { id: 1, caddie: 'NANA', workNo: '085', rating: 5, comment: 'Very helpful and knows the course well.', customer: 'Budi S.', date: '2026-04-27' },
    { id: 2, caddie: 'SITI', workNo: '102', rating: 4, comment: 'Good service, but a bit slow on the green.', customer: 'Ani W.', date: '2026-04-26' },
    { id: 3, caddie: 'ANI', workNo: '045', rating: 5, comment: 'Excellent! Highly recommended.', customer: 'Joko T.', date: '2026-04-25' },
    { id: 4, caddie: 'NANA', workNo: '085', rating: 5, comment: 'Always the best caddie.', customer: 'Siti A.', date: '2026-04-24' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Caddie Rating & Feedback
        </h2>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input 
            type="text" 
            placeholder="Search by caddie name or work number..." 
            className="w-full bg-gray-100 border-none rounded-lg px-10 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select className="bg-gray-100 border-none rounded-lg px-4 py-2 outline-none text-sm font-medium">
          <option>All Ratings</option>
          <option>5 Stars</option>
          <option>4 Stars</option>
          <option>3 Stars & Below</option>
        </select>
        <button className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Ratings List */}
      <div className="grid grid-cols-1 gap-4">
        {ratings.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {item.caddie[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{item.caddie}</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Work No: {item.workNo}</p>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < item.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200'} 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">{item.date}</span>
              </div>
              <div className="flex gap-2 text-gray-600">
                <MessageSquare size={16} className="mt-1 flex-shrink-0 text-gray-400" />
                <p className="text-sm italic">"{item.comment}"</p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <p className="text-xs font-bold text-gray-500">By {item.customer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaddieRating;
