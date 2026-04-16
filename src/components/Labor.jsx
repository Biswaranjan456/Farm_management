import React, { useState } from 'react';
import { Plus, Trash2, Users, Clock, Edit2, Search } from 'lucide-react';

export default function Labor({ data, setData }) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ date: '', worker: '', task: '', hours: '' });

  const filteredData = data.filter(l => 
    l.worker.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.date.includes(searchTerm)
  );

  const submit = () => {
    if (!form.date || !form.worker || !form.task || form.hours === '' || form.hours === null || form.hours === undefined) {
      alert('Please fill all fields');
      return;
    }
    if (editId) {
      setData(data.map(item => item.id === editId ? { ...form, done: item.done, id: editId } : item));
      setEditId(null);
    } else {
      setData([...data, { ...form, done: false, id: Date.now() }]);
    }
    setForm({ date: '', worker: '', task: '', hours: '' });
    setShow(false);
  };

  const handleEdit = (item) => {
    setForm({ date: item.date, worker: item.worker, task: item.task, hours: item.hours });
    setEditId(item.id);
    setShow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = (id) => {
    setData(data.map(l => l.id === id ? { ...l, done: !l.done } : l));
  };

  const pendingTasks = data.filter(l => !l.done).length;
  const completedTasks = data.length - pendingTasks;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex items-center min-h-[auto] sm:min-h-[16rem]">
        <img 
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=400&fit=crop" 
          alt="Labor Management"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full bg-gradient-to-r from-purple-900/90 to-purple-700/70 py-4 sm:py-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold">Labor & Resource Scheduling</h2>
                <p className="text-purple-100 text-sm sm:text-lg mt-0 sm:mt-1">Manage your workforce efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-purple-100 text-sm">Pending Tasks</p>
                <p className="text-3xl font-bold mt-1">{pendingTasks}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-purple-100 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-1">{completedTasks}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-purple-100 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold mt-1">{data.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!show && (
        <button 
          onClick={() => { setShow(true); setEditId(null); setForm({ date: '', worker: '', task: '', hours: '' }); }} 
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-4 rounded-xl hover:from-purple-700 hover:to-purple-600 transition shadow-lg flex items-center justify-center font-medium text-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          Schedule New Task
        </button>
      )}

      {show && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border-2 border-purple-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            {editId ? 'Edit Task' : 'New Task Assignment'}
          </h3>
          
          <input 
            type="date" 
            value={form.date} 
            onChange={e => setForm({ ...form, date: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition" 
          />
          
          <input 
            type="text" 
            placeholder="Worker/Team Name" 
            value={form.worker} 
            onChange={e => setForm({ ...form, worker: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition" 
          />
          
          <input 
            type="text" 
            placeholder="Task Description" 
            value={form.task} 
            onChange={e => setForm({ ...form, task: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition" 
          />
          
          <input 
            type="number" 
            step="0.5" 
            placeholder="Estimated Hours" 
            value={form.hours} 
            onChange={e => setForm({ ...form, hours: e.target.value })} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition" 
          />
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={submit} 
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Schedule Task
            </button>
            <button 
              onClick={() => {
                setShow(false);
                setEditId(null);
                setForm({ date: '', worker: '', task: '', hours: '' });
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
            placeholder="Search tasks by worker, description or date..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition bg-white" 
          />
        </div>
      )}

      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-gray-500 text-lg">{data.length === 0 ? 'No tasks scheduled yet' : 'No results found'}</p>
            <p className="text-gray-400 text-sm mt-2">{data.length === 0 ? 'Start scheduling your workforce' : 'Try a different search term'}</p>
          </div>
        ) : (
          filteredData.map(l => (
            <div 
              key={l.id} 
              className={`bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 ${
                l.done ? 'border-green-500' : 'border-yellow-500'
              }`}
            >
              <div className="flex-1">
                <div className="flex gap-2 text-sm mb-2">
                  <span className="text-gray-600 font-medium">{l.date}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    l.done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {l.done ? '✓ Completed' : '⏳ Scheduled'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">{l.worker}</h3>
                <p className="text-gray-600">{l.task}</p>
                <div className="flex items-center gap-1 mt-2 text-purple-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{l.hours} hours</span>
                </div>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto justify-end mt-4 sm:mt-0">
                <button 
                  onClick={() => toggle(l.id)} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    l.done 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {l.done ? 'Undo' : 'Complete'}
                </button>
                <button 
                  onClick={() => handleEdit(l)} 
                  className="text-blue-500 hover:text-blue-700 transition p-2 rounded-lg hover:bg-blue-50"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setData(data.filter(x => x.id !== l.id))} 
                  className="text-red-500 hover:text-red-700 transition p-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}