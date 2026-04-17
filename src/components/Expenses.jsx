import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, IndianRupee, TrendingDown, Edit2, Search, FileDown, Download } from 'lucide-react';
import { exportExpensesPDF } from '../utils/pdfExport';
import offlineStorage from '../utils/offlineStorage';

export default function Expenses({ data, setData }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ date: '', cat: '', desc: '', amt: '' });
  const total = data.reduce((s, e) => s + parseFloat(e.amt || 0), 0);

  const filteredData = data.filter(e => 
    e.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.date.includes(searchTerm)
  );

  const exportPDF = () => {
    console.log('Export PDF clicked, data:', data);
    try {
      exportExpensesPDF(data);
    } catch (error) {
      console.error('Error in exportPDF:', error);
      alert('Error exporting PDF. Please check console for details.');
    }
  };

  const exportCSV = () => {
    let csvContent = 'Date,Category,Description,Amount\n';
    data.forEach(e => {
      csvContent += `${e.date},${e.cat},"${e.desc}",${e.amt}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'expenses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const submit = () => {
    if (!form.date || !form.cat || !form.desc || !form.amt) {
      alert(t('expenses.fillAllFields', 'Please fill all fields: Date, Category, Description, Amount'));
      return;
    }
    const newExpense = editId ? { ...form, id: editId } : { ...form, id: Date.now() };
    
    if (editId) {
      setData(data.map(item => item.id === editId ? newExpense : item));
      if (!offlineStorage.isOnline()) {
        offlineStorage.saveExpenseOffline(newExpense);
      }
      setEditId(null);
    } else {
      setData([...data, newExpense]);
      if (!offlineStorage.isOnline()) {
        offlineStorage.saveExpenseOffline(newExpense);
      }
    }
    setForm({ date: '', cat: '', desc: '', amt: '' });
    setShow(false);
  };

  const handleEdit = (item) => {
    setForm({ date: item.date, cat: item.cat, desc: item.desc, amt: item.amt });
    setEditId(item.id);
    setShow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex items-center min-h-[auto] sm:min-h-[16rem]">
        <img 
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=400&fit=crop" 
          alt="Financial Planning"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full bg-gradient-to-r from-green-900/90 to-green-700/70 py-4 sm:py-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold">{t('expenses.title', 'Expense Tracking')}</h2>
                <p className="text-green-100 text-sm sm:text-lg mt-0 sm:mt-1">{t('expenses.subtitle', 'Monitor your farm expenditures efficiently')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-green-100 text-sm">{t('expenses.totalSpent', 'Total Spent')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <IndianRupee className="w-6 h-6" />
                  <span className="text-3xl font-bold">{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-green-100 text-sm">{t('expenses.transactions', 'Transactions')}</p>
                <p className="text-3xl font-bold mt-1">{data.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {!show && (
        <button 
          onClick={() => { setShow(true); setEditId(null); setForm({ date: '', cat: '', desc: '', amt: '' }); }} 
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-600 transition shadow-lg flex items-center justify-center font-medium text-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          {t('expenses.addNew', 'Add New Expense')}
        </button>
      )}

      {/* Add Form */}
      {show && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 border-2 border-green-100 dark:border-green-800">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-green-600" />
            {editId ? t('expenses.edit', 'Edit Expense') : t('expenses.newExpense', 'New Expense Entry')}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.date', 'Date')}</label>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-green-500 focus:outline-none transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expenses.category', 'Category')}</label>
            <select 
              value={form.cat} 
              onChange={e => setForm({ ...form, cat: e.target.value })} 
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-green-500 focus:outline-none transition"
            >
              <option value="">{t('expenses.selectCategory', 'Select Category')}</option>
              <option value="Seeds">{t('expenses.categories.seeds', 'Seeds')}</option>
              <option value="Fertilizer">{t('expenses.categories.fertilizer', 'Fertilizer')}</option>
              <option value="Equipment">{t('expenses.categories.equipment', 'Equipment')}</option>
              <option value="Labor">{t('expenses.categories.labor', 'Labor')}</option>
              <option value="Utilities">{t('expenses.categories.utilities', 'Utilities')}</option>
              <option value="Other">{t('expenses.categories.other', 'Other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.description', 'Description')}</label>
            <input 
              type="text" 
              placeholder={t('expenses.placeholder.description', 'What was this expense for?')}
              value={form.desc} 
              onChange={e => setForm({ ...form, desc: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-green-500 focus:outline-none transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expenses.amount', 'Amount')}</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <IndianRupee className="w-5 h-5" />
              </div>
              <input 
                type="number" 
                step="0.01" 
                placeholder={t('expenses.placeholder.amount', '0.00')}
                value={form.amt} 
                onChange={e => setForm({ ...form, amt: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-green-500 focus:outline-none transition" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={submit} 
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              {t('common.save', 'Save')}
            </button>
            <button 
              onClick={() => {
                setShow(false);
                setEditId(null);
                setForm({ date: '', cat: '', desc: '', amt: '' });
              }} 
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
            placeholder="Search expenses by description, category or date..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-green-500 focus:outline-none transition" 
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
            <span className="hidden sm:inline">{t('common.pdf', 'PDF')}</span>
          </button>
          
          <button 
            onClick={exportCSV} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('common.csv', 'CSV')}</span>
          </button>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{data.length === 0 ? t('expenses.empty', 'No expenses recorded yet') : t('expenses.noResults', 'No results found')}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{data.length === 0 ? t('expenses.emptySubtext', "Click 'Add New Expense' to get started") : t('expenses.tryDifferentSearch', 'Try a different search term')}</p>
          </div>
        ) : (
          filteredData.map(e => (
            <div 
              key={e.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-green-500"
            >
              <div className="flex-1 w-full">
                <div className="flex gap-2 text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{e.date}</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-full text-xs font-medium">
                    {e.cat}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-lg">{e.desc}</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/50 px-4 py-2 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-green-700 dark:text-green-300" />
                  <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {parseFloat(e.amt).toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={() => handleEdit(e)} 
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setData(data.filter(x => x.id !== e.id));
                    if (!offlineStorage.isOnline()) {
                      offlineStorage.deleteExpenseOffline(e.id);
                    }
                  }} 
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700"
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