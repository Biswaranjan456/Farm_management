import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Sprout, Edit2, Search } from 'lucide-react';

export default function Diary({ data, setData }) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ date: '', activity: '', crop: '', yield: '', notes: '' });

  const filteredData = data.filter(d => 
    d.crop.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.date.includes(searchTerm)
  );

  const submit = () => {
    if (!form.date || !form.activity || !form.crop) {
      alert('Please fill required fields');
      return;
    }
    if (editId) {
      setData(data.map(item => item.id === editId ? { ...form, id: editId } : item));
      setEditId(null);
    } else {
      setData([...data, { ...form, id: Date.now() }]);
    }
    setForm({ date: '', activity: '', crop: '', yield: '', notes: '' });
    setShow(false);
  };

  const handleEdit = (item) => {
    setForm({ date: item.date, activity: item.activity, crop: item.crop, yield: item.yield || '', notes: item.notes || '' });
    setEditId(item.id);
    setShow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex items-center min-h-[auto] sm:min-h-[16rem]">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop" 
          alt="Farm Diary"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full bg-gradient-to-r from-blue-900/90 to-blue-700/70 py-4 sm:py-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold">Farm Diary & Yield Records</h2>
                <p className="text-blue-100 text-sm sm:text-lg mt-0 sm:mt-1">Track daily activities and harvest data</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-blue-100 text-sm">Total Entries</p>
                <p className="text-3xl font-bold mt-1">{data.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-blue-100 text-sm">Recent Activity</p>
                <p className="text-xl font-bold mt-1">
                  {data.length > 0 ? data[data.length - 1].activity : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!show && (
        <button 
          onClick={() => { setShow(true); setEditId(null); setForm({ date: '', activity: '', crop: '', yield: '', notes: '' }); }} 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition shadow-lg flex items-center justify-center font-medium text-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          Add Diary Entry
        </button>
      )}

      {show && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border-2 border-blue-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-blue-600" />
            {editId ? 'Edit Diary Entry' : 'New Diary Entry'}
          </h3>
          
          <input 
            type="date" 
            value={form.date} 
            onChange={e => setForm({ ...form, date: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition" 
          />
          
          <input 
            type="text" 
            placeholder="Activity (e.g., Planting, Harvesting, Irrigation)" 
            value={form.activity} 
            onChange={e => setForm({ ...form, activity: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition" 
          />
          
          <input 
            type="text" 
            placeholder="Crop/Field Name" 
            value={form.crop} 
            onChange={e => setForm({ ...form, crop: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition" 
          />
          
          <input 
            type="text" 
            placeholder="Yield (optional, e.g., 500 kg)" 
            value={form.yield} 
            onChange={e => setForm({ ...form, yield: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition" 
          />
          
          <textarea 
            placeholder="Additional notes and observations..." 
            value={form.notes} 
            onChange={e => setForm({ ...form, notes: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition" 
            rows="4" 
          />
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={submit} 
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Entry
            </button>
            <button 
              onClick={() => {
                setShow(false);
                setEditId(null);
                setForm({ date: '', activity: '', crop: '', yield: '', notes: '' });
              }} 
              className="px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {data.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search diary by crop, activity or date..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition bg-white" 
          />
        </div>
      )}

      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-gray-500 text-lg">{data.length === 0 ? 'No diary entries yet' : 'No results found'}</p>
            <p className="text-gray-400 text-sm mt-2">{data.length === 0 ? 'Start documenting your farm activities' : 'Try a different search term'}</p>
          </div>
        ) : (
          filteredData.map(d => (
            <div 
              key={d.id} 
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-500"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-4">
                <div className="flex-1 w-full">
                  <div className="flex gap-2 text-sm mb-3">
                    <span className="text-gray-600 font-medium">{d.date}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {d.activity}
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800 mb-2">{d.crop}</h3>
                  {d.yield && (
                    <div className="flex items-center gap-2 mb-3 bg-green-50 px-3 py-2 rounded-lg inline-block">
                      <Sprout className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-semibold">Yield: {d.yield}</span>
                    </div>
                  )}
                  {d.notes && (
                    <p className="text-gray-600 text-sm mt-3 bg-gray-50 p-4 rounded-lg border-l-2 border-blue-300">
                      {d.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                  <button 
                    onClick={() => handleEdit(d)} 
                    className="text-blue-500 hover:text-blue-700 transition p-2 rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setData(data.filter(x => x.id !== d.id))} 
                    className="text-red-500 hover:text-red-700 transition p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}