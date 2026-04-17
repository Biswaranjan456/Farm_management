import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Package, AlertTriangle, Edit2, Search, FileDown, Download } from 'lucide-react';
import { exportInventoryPDF } from '../utils/pdfExport';

export default function Inventory({ data, setData }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', cat: '', qty: '', unit: '', min: '' });
  
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportPDF = () => {
    try {
      exportInventoryPDF(data);
    } catch (error) {
      console.error('Error in exportPDF:', error);
      alert('Error exporting PDF. Please check console for details.');
    }
  };

  const exportCSV = () => {
    let csvContent = 'Name,Category,Quantity,Unit,Min Stock\n';
    data.forEach(i => {
      csvContent += `"${i.name}",${i.cat},${i.qty},${i.unit},${i.min}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'inventory.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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
      alert(t('inventory.fillAllFields', 'Please fill all fields'));
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
                <h2 className="text-2xl sm:text-4xl font-bold">{t('inventory.title', 'Inventory & Supply Tracking')}</h2>
                <p className="text-indigo-100 text-sm sm:text-lg mt-0 sm:mt-1">{t('inventory.subtitle', 'Keep track of all your farm supplies')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-indigo-100 text-sm">{t('inventory.totalItems', 'Total Items')}</p>
                <p className="text-3xl font-bold mt-1">{data.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-indigo-100 text-sm">{t('inventory.lowStockAlerts', 'Low Stock Alerts')}</p>
                <div className="flex items-center gap-2 mt-1">
                  {lowStockCount > 0 && <AlertTriangle className="w-6 h-6 text-red-300" />}
                  <span className="text-3xl font-bold">{lowStockCount}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-indigo-100 text-sm">{t('inventory.categories', 'Categories')}</p>
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
          {t('inventory.addNew', 'Add Inventory Item')}
        </button>
      )}

      {/* Add Form */}
      {show && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 border-2 border-indigo-100 dark:border-indigo-800">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            {editId ? t('inventory.edit', 'Edit Inventory Item') : t('inventory.newItem', 'New Inventory Item')}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('inventory.itemName', 'Item Name')}</label>
            <input 
              type="text" 
              placeholder={t('inventory.placeholder.name', 'e.g., Urea Fertilizer')}
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('inventory.category', 'Category')}</label>
            <select 
              value={form.cat} 
              onChange={(e) => setForm({ ...form, cat: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="">{t('inventory.selectCategory', 'Select Category')}</option>
              <option value="Seeds">{t('inventory.categories.seeds', 'Seeds')}</option>
              <option value="Fertilizer">{t('inventory.categories.fertilizer', 'Fertilizer')}</option>
              <option value="Equipment">{t('inventory.categories.equipment', 'Equipment')}</option>
              <option value="Chemicals">{t('inventory.categories.chemicals', 'Chemicals')}</option>
              <option value="Tools">{t('inventory.categories.tools', 'Tools')}</option>
              <option value="Other">{t('inventory.categories.other', 'Other')}</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('inventory.quantity', 'Quantity')}</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder={t('inventory.placeholder.quantity', '100')}
                value={form.qty} 
                onChange={(e) => setForm({ ...form, qty: e.target.value })} 
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('inventory.unit', 'Unit')}</label>
              <select 
                value={form.unit} 
                onChange={(e) => setForm({ ...form, unit: e.target.value })} 
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="">{t('inventory.selectUnit', 'Select Unit')}</option>
                <option value="kg">{t('inventory.units.kg', 'kg')}</option>
                <option value="lbs">{t('inventory.units.lbs', 'lbs')}</option>
                <option value="liters">{t('inventory.units.liters', 'liters')}</option>
                <option value="units">{t('inventory.units.units', 'units')}</option>
                <option value="bags">{t('inventory.units.bags', 'bags')}</option>
                <option value="boxes">{t('inventory.units.boxes', 'boxes')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('inventory.minStock', 'Minimum Stock Alert Level')}</label>
            <input 
              type="number" 
              step="0.1" 
              placeholder={t('inventory.placeholder.minStock', '20')}
              value={form.min} 
              onChange={(e) => setForm({ ...form, min: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition" 
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={submit} 
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              {t('inventory.addItem', 'Add Item')}
            </button>
            <button 
              onClick={cancelForm} 
              className="px-6 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {data.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder={t('inventory.searchPlaceholder', 'Search inventory by item name or category...')}
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition" 
          />
        </div>
      )}

      {/* Export Buttons */}
      {data.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button 
            onClick={exportPDF} 
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
            title="Export to PDF"
          >
            <FileDown className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          
          <button 
            onClick={exportCSV} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      )}

      {/* Inventory List */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-indigo-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{data.length === 0 ? t('inventory.empty', 'No inventory items yet') : t('inventory.noResults', 'No results found')}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{data.length === 0 ? t('inventory.emptySubtext', 'Start tracking your farm supplies') : t('inventory.tryDifferentSearch', 'Try a different search term')}</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const currentQty = parseFloat(item.qty);
            const minQty = parseFloat(item.min);
            const isLowStock = !isNaN(currentQty) && !isNaN(minQty) && currentQty <= minQty;
            
            return (
              <div 
                key={item.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 ${
                  isLowStock ? 'border-red-500' : 'border-indigo-500'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-2xl text-gray-800 dark:text-white">{item.name}</h3>
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 rounded-full text-sm font-medium">
                        {item.cat}
                      </span>
                      {isLowStock && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-full text-sm font-medium flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {t('inventory.lowStock', 'Low Stock')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                      <div className="bg-indigo-50 dark:bg-indigo-900/50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-indigo-200">{t('inventory.currentStock', 'Current Stock')}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{item.qty}</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{item.unit}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('inventory.minStockLabel', 'Min Stock')}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">{item.min}</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isLowStock && (
                      <div className="mt-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-red-800 dark:text-red-300 font-semibold text-sm">
                              {t('inventory.lowStockAlertTitle', 'Low Stock Alert')}
                            </p>
                            <p className="text-red-700 dark:text-red-400 text-xs mt-1">
                              {t('inventory.lowStockAlertText', 'Stock level has reached minimum threshold. Reorder soon to avoid shortage.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 flex justify-center"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)} 
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 flex justify-center"
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