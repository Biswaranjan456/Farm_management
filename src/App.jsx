import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, BookOpen, Users, Package, Download, FileText, FileDown, LayoutDashboard } from 'lucide-react';
import Expenses from './components/Expenses';
import Diary from './components/Diary';
import Labor from './components/Labor';
import Inventory from './components/Inventory';
import Dashboard from './components/Dashboard';
import WeatherWidget from './components/WeatherWidget';
import LanguageSwitcher from './components/LanguageSwitcher';
import Login from './components/Login';
import logo from "./assets/farm-logo.png";
import { 
  exportExpensesPDF, 
  exportDiaryPDF, 
  exportLaborPDF, 
  exportInventoryPDF,
  exportAllDataPDF 
} from './utils/pdfExport';

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [diary, setDiary] = useState([]);
  const [labor, setLabor] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // Check if data is loaded

  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // Bina login ke data load mat karo
      try {
        const response = await fetch(`http://localhost:5001/api/data/${user.email}`);
        const data = await response.json();
        
        setExpenses(data.expenses || []);
        setDiary(data.diary || []);
        setLabor(data.labor || []);
        setInventory(data.inventory || []);
        setIsLoaded(true);
      } catch (err) {
        console.log('Error loading data', err);
        setIsLoaded(true);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (!user || !isLoaded) return;
    
    // Save data to MongoDB whenever it changes
    const saveData = async () => {
      try {
        await fetch('http://localhost:5001/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, expenses, diary, labor, inventory })
        });
      } catch (err) {
        console.log('Error saving data');
      }
    };
    saveData();
  }, [expenses, diary, labor, inventory, user, isLoaded]);

  const exportCSV = () => {
    let csvContent = '';
    let filename = '';
    
    if (tab === 'expenses') {
      csvContent = 'Date,Category,Description,Amount\n';
      expenses.forEach(e => {
        csvContent += `${e.date},${e.cat},"${e.desc}",${e.amt}\n`;
      });
      filename = 'expenses.csv';
    } else if (tab === 'diary') {
      csvContent = 'Date,Activity,Crop,Yield,Notes\n';
      diary.forEach(d => {
        csvContent += `${d.date},${d.activity},"${d.crop}","${d.yield}","${d.notes}"\n`;
      });
      filename = 'diary.csv';
    } else if (tab === 'labor') {
      csvContent = 'Date,Worker,Task,Hours,Status\n';
      labor.forEach(l => {
        csvContent += `${l.date},"${l.worker}","${l.task}",${l.hours},${l.done ? 'Completed' : 'Scheduled'}\n`;
      });
      filename = 'labor.csv';
    } else if (tab === 'inventory') {
      csvContent = 'Name,Category,Quantity,Unit,Min Stock\n';
      inventory.forEach(i => {
        csvContent += `"${i.name}",${i.cat},${i.qty},${i.unit},${i.min}\n`;
      });
      filename = 'inventory.csv';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const allData = {
      expenses, diary, labor, inventory,
      exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
   link.download = 'farm_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentPDF = () => {
    if (tab === 'expenses') {
      exportExpensesPDF(expenses);
    } else if (tab === 'diary') {
      exportDiaryPDF(diary);
    } else if (tab === 'labor') {
      exportLaborPDF(labor);
    } else if (tab === 'inventory') {
      exportInventoryPDF(inventory);
    }
  };

  const exportFullReport = () => {
    exportAllDataPDF(expenses, diary, labor, inventory);
  };

  const tabs = [
    { id: 'dashboard', name: t('dashboard.title', 'Overview'), icon: LayoutDashboard },
    { id: 'expenses', name: t('expenses.title'), icon: DollarSign },
    { id: 'diary', name: t('diary.title'), icon: BookOpen },
    { id: 'labor', name: t('labor.title'), icon: Users },
    { id: 'inventory', name: t('inventory.title'), icon: Package }
  ];

  // If user is not logged in, show Login page instead of Dashboard
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg pt-2 pb-2 md:pt-1 md:pb-5 lg:pt-0 lg:pb-6 px-2 sm:px-6 mb-2 sm:mb-4 md:mb-8 lg:mb-10 z-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-0">
            <div className="flex flex-col items-center -mt-8  sm:-mt-6 md:-mt-10 lg:-mt-14 -mb-2 sm:-mb-4 md:-mb-6">
              <img src={logo} alt="Farm Logo" className="w-50 sm:w-64 md:w-80 lg:w-96 -mb-3  h-auto object-contain drop-shadow-xl relative z-10 " />
              <p className="-mt-9 mb-4   sm:-mt-10 md:-mt-14 lg:-mt-18 mb-10 text-white font-serif italic text-[11px] sm:text-sm md:text-base lg:text-lg font-bold tracking-widest text-center drop-shadow-md px-2 z-20 relative ">
                {t('common.appTagline', 'Every Farmer\'s Digital Companion')}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center z-20 mt-1 md:mt-0">
              <WeatherWidget />
              <LanguageSwitcher />
              <button 
                onClick={() => {
                  setUser(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white shadow overflow-x-auto">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center">
          <div className="flex w-full lg:w-auto overflow-x-auto hide-scrollbar">
            {tabs.map(t => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)}
                className={`flex items-center px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base font-medium transition whitespace-nowrap ${
                  tab === t.id 
                    ? 'border-b-4 border-green-600 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <t.icon className="w-5 h-5 mr-2" />
                {t.name}
              </button>
            ))}
          </div>
          
          {/* Export Buttons */}
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-2 sm:p-4 w-full lg:w-auto">
            <button 
              onClick={exportCurrentPDF} 
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
              title={t('export.pdf')}
            >
              <FileDown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('export.pdf')}</span>
            </button>
            
            <button 
              onClick={exportCSV} 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              title={t('export.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('export.csv')}</span>
            </button>
            
            <button 
              onClick={exportJSON} 
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              title={t('export.json')}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('export.json')}</span>
            </button>
            
            <button 
              onClick={exportFullReport} 
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md font-semibold"
              title={t('export.fullReport')}
            >
              <FileDown className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">{t('export.fullReport')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-3 sm:p-6">
        {tab === 'dashboard' && <Dashboard expenses={expenses} inventory={inventory} labor={labor} diary={diary} />}
        {tab === 'expenses' && <Expenses data={expenses} setData={setExpenses} />}
        {tab === 'diary' && <Diary data={diary} setData={setDiary} />}
        {tab === 'labor' && <Labor data={labor} setData={setLabor} />}
        {tab === 'inventory' && <Inventory data={inventory} setData={setInventory} />}
      </main>
    </div>
  );
} 