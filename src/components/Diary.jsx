import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, BookOpen, Edit2, Search, BookCopy, Wheat, FileDown, Download } from 'lucide-react';
import { exportDiaryPDF } from '../utils/pdfExport';

export default function Diary({ data, setData }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ date: '', activity: '', crop: '', yield: '', notes: '' });

  const totalEntries = data.length;
  const uniqueCrops = [...new Set(data.map(d => d.crop).filter(Boolean))].length;

  const filteredData = data.filter(d =>
    d.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.crop && d.crop.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.date.includes(searchTerm)
  );

  const exportPDF = () => {
    try {
      exportDiaryPDF(data);
    } catch (error) {
      console.error('Error in exportPDF:', error);
      alert('Error exporting PDF. Please check console for details.');
    }
  };

  const exportCSV = () => {
    let csvContent = 'Date,Activity,Crop,Yield,Notes\n';
    data.forEach(d => {
      csvContent += `${d.date},${d.activity},"${d.crop}","${d.yield}","${d.notes}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'diary.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const submit = () => {
    if (!form.date || !form.activity) {
      alert(t('diary.fillRequiredFields', 'Please fill at least Date and Activity'));
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
    setForm({ date: item.date, activity: item.activity, crop: item.crop, yield: item.yield, notes: item.notes });
    setEditId(item.id);
    setShow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex items-center min-h-[auto] sm:min-h-[16rem]">
        <img 
          src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=1200&h=400&fit=crop" 
          alt="Farm Diary"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full bg-gradient-to-r from-yellow-900/90 to-yellow-700/70 py-4 sm:py-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold">{t('diary.title', 'Farm Diary & Yield Records')}</h2>
                <p className="text-yellow-100 text-sm sm:text-lg mt-0 sm:mt-1">{t('diary.subtitle', 'Record your daily activities and observations')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-yellow-100 text-sm">{t('diary.totalEntries', 'Total Entries')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <BookCopy className="w-6 h-6" />
                  <span className="text-3xl font-bold">{totalEntries}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-yellow-100 text-sm">{t('diary.uniqueCrops', 'Unique Crops')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Wheat className="w-6 h-6" />
                  <span className="text-3xl font-bold">{uniqueCrops}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!show && (
        <button onClick={() => { setShow(true); setEditId(null); setForm({ date: '', activity: '', crop: '', yield: '', notes: '' }); }} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white py-4 rounded-xl hover:from-yellow-700 hover:to-yellow-600 transition shadow-lg flex items-center justify-center font-medium text-lg">
          <Plus className="w-6 h-6 mr-2" />
          {t('diary.addNew', 'Add New Diary Entry')}
        </button>
      )}

      {show && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 border-2 border-yellow-100 dark:border-yellow-800">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-yellow-600" />
            {editId ? t('diary.edit', 'Edit Diary Entry') : t('diary.new', 'New Diary Entry')}
          </h3>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-500 focus:outline-none transition" />
          <input type="text" placeholder={t('diary.placeholder.activity', 'Activity (e.g., Planting, Harvesting)')} value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-500 focus:outline-none transition" />
          <input type="text" placeholder={t('diary.placeholder.crop', 'Crop (e.g., Wheat, Tomato)')} value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-500 focus:outline-none transition" />
          <input type="text" placeholder={t('diary.placeholder.yield', 'Yield (e.g., 500 kg, 20 boxes)')} value={form.yield} onChange={e => setForm({ ...form, yield: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-500 focus:outline-none transition" />
          <textarea placeholder={t('diary.placeholder.notes', 'Notes and observations...')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-500 focus:outline-none transition" rows="3"></textarea>
          <div className="flex gap-3 pt-2">
            <button onClick={submit} className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition font-medium">{t('common.save', 'Save')}</button>
            <button onClick={() => { setShow(false); setEditId(null); setForm({ date: '', activity: '', crop: '', yield: '', notes: '' }); }} className="px-6 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium">{t('common.cancel', 'Cancel')}</button>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Search className="w-5 h-5" /></div>
          <input type="text" placeholder={t('diary.searchPlaceholder', 'Search entries by activity, crop, or date...')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-500 focus:outline-none transition" />
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

      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-12 h-12 text-yellow-600" /></div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{data.length === 0 ? t('diary.empty', 'No diary entries yet') : t('diary.noResults', 'No results found')}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{data.length === 0 ? t('diary.emptySubtext', 'Start recording your farm activities') : t('diary.tryDifferentSearch', 'Try a different search term')}</p>
          </div>
        ) : (
          filteredData.map(d => (
            <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{d.date}</p>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mt-1">{d.activity}</h3>
                  {d.crop && <p className="text-gray-600 dark:text-gray-300 text-sm"><strong>{t('diary.crop', 'Crop')}:</strong> {d.crop}</p>}
                  {d.yield && <p className="text-gray-600 dark:text-gray-300 text-sm"><strong>{t('diary.yield', 'Yield')}:</strong> {d.yield}</p>}
                  {d.notes && <p className="text-gray-700 dark:text-gray-200 mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{d.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(d)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => setData(data.filter(x => x.id !== d.id))} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}