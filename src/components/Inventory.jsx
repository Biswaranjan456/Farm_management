import React, { useState } from 'react';
import { Plus, Trash2, Package, AlertTriangle, Edit2, Search } from 'lucide-react';

export default function Inventory({ data, setData }) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', cat: '', qty: '', unit: '', min: '' });
  
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate low stock items
  const lowStockCount = data.filter(item => {
    const currentQty = parseFloat(item.qty);
    const minQty = parseFloat(item.min);
    return !isNaN(currentQty) && !isNaN(minQty) && currentQty <= minQty;
  }).length;

  // Calculate unique categories
  const categoryCount = [...new Set(data.map(item => item.cat))].length;

  const submit = () => {
    if (!form.name || !form.cat || !form.qty || !form.unit || !form.min) {
      alert('Please fill all fields');
      return;
    }
    
    if (editId) {
      setData(data.map(item => item.id === editId ? { ...form, id: editId } : item));
      setEditId(null);
    } else {
      setData([...data, { ...form, id: Date.now() }]);
    }
    
    setForm({ name: '', cat: '', qty: '', unit: '', min: '' });
    setShow(false);
  };

  const deleteItem = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, cat: item.cat, qty: item.qty, unit: item.unit, min: item.min });
    setEditId(item.id);
    setShow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setShow(false);
    setEditId(null);
    setForm({ name: '', cat: '', qty: '', unit: '', min: '' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex items-center min-h-[auto] sm:min-h-[16rem]">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop" 
          alt="Inventory Management"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full bg-gradient-to-r from-indigo-900/90 to-indigo-700/70 py-4 sm:py-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold">Inventory & Supply Tracking</h2>
                <p className="text-indigo-100 text-sm sm:text-lg mt-0 sm:mt-1">Keep track of all your farm supplies</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-indigo-100 text-sm">Total Items</p>
                <p className="text-3xl font-bold mt-1">{data.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-indigo-100 text-sm">Low Stock Alerts</p>
                <div className="flex items-center gap-2 mt-1">
                  {lowStockCount > 0 && <AlertTriangle className="w-6 h-6 text-red-300" />}
                  <span className="text-3xl font-bold">{lowStockCount}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-indigo-100 text-sm">Categories</p>
                <p className="text-3xl font-bold mt-1">{categoryCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {!show && (
        <button 
          onClick={() => { setShow(true); setEditId(null); setForm({ name: '', cat: '', qty: '', unit: '', min: '' }); }} 
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition shadow-lg flex items-center justify-center font-medium text-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          Add Inventory Item
        </button>
      )}

      {/* Add Form */}
      {show && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border-2 border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            {editId ? 'Edit Inventory Item' : 'New Inventory Item'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input 
              type="text" 
              placeholder="e.g., Urea Fertilizer" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={form.cat} 
              onChange={(e) => setForm({ ...form, cat: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="">Select Category</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Equipment">Equipment</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Tools">Tools</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="100" 
                value={form.qty} 
                onChange={(e) => setForm({ ...form, qty: e.target.value })} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select 
                value={form.unit} 
                onChange={(e) => setForm({ ...form, unit: e.target.value })} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="">Select Unit</option>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="liters">liters</option>
                <option value="units">units</option>
                <option value="bags">bags</option>
                <option value="boxes">boxes</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Alert Level</label>
            <input 
              type="number" 
              step="0.1" 
              placeholder="20" 
              value={form.min} 
              onChange={(e) => setForm({ ...form, min: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition" 
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={submit} 
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Add Item
            </button>
            <button 
              onClick={cancelForm} 
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
            placeholder="Search inventory by item name or category..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition bg-white" 
          />
        </div>
      )}

      {/* Inventory List */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-indigo-600" />
            </div>
            <p className="text-gray-500 text-lg">{data.length === 0 ? 'No inventory items yet' : 'No results found'}</p>
            <p className="text-gray-400 text-sm mt-2">{data.length === 0 ? 'Start tracking your farm supplies' : 'Try a different search term'}</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const currentQty = parseFloat(item.qty);
            const minQty = parseFloat(item.min);
            const isLowStock = !isNaN(currentQty) && !isNaN(minQty) && currentQty <= minQty;
            
            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 ${
                  isLowStock ? 'border-red-500' : 'border-indigo-500'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-2xl text-gray-800">{item.name}</h3>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {item.cat}
                      </span>
                      {isLowStock && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Low Stock
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                      <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600">Current Stock</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold text-indigo-700">{item.qty}</span>
                          <span className="text-gray-600 text-sm">{item.unit}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600">Min Stock</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-semibold text-gray-700">{item.min}</span>
                          <span className="text-gray-600 text-sm">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isLowStock && (
                      <div className="mt-3 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-red-800 font-semibold text-sm">
                              Low Stock Alert
                            </p>
                            <p className="text-red-700 text-xs mt-1">
                              Stock level has reached minimum threshold. Reorder soon to avoid shortage.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="text-blue-500 hover:text-blue-700 transition p-2 rounded-lg hover:bg-blue-50 flex justify-center"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)} 
                      className="text-red-500 hover:text-red-700 transition p-2 rounded-lg hover:bg-red-50 flex justify-center"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}