import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IndianRupee, BookOpen, Users, Package, Download, FileDown, LayoutDashboard, Clock } from 'lucide-react';
import Expenses from './components/Expenses';
import Diary from './components/Diary';
import Labor from './components/Labor';
import LaborManagement from './components/LaborManagement';

import Inventory from './components/Inventory';
import Dashboard from './components/Dashboard';
import WeatherWidget from './components/WeatherWidget';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import Login from './components/Login';
import logo from "./assets/farm-logo.png";
import { 
  exportAllDataPDF 
} from './utils/pdfExport';
import offlineStorage from './utils/offlineStorage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      
      if (offlineStorage.isOnline()) {
        // Load from server
        try {
          const response = await fetch(`/api/data/${user.email}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          const data = await response.json();
          
          setExpenses(data.expenses || []);
          setDiary(data.diary || []);
          setLabor(data.labor || []);
          setInventory(data.inventory || []);
          
          // Sync any offline data to server
          await offlineStorage.syncDataToServer(user.email, user.token);
        } catch (err) {
          console.log('Error loading data from server, loading offline data', err);
          // Load from offline storage if server fails
          const offlineExpenses = await offlineStorage.getExpensesOffline();
          const offlineDiary = await offlineStorage.getDiaryOffline();
          const offlineLabor = await offlineStorage.getLaborOffline();
          const offlineInventory = await offlineStorage.getInventoryOffline();
          
          setExpenses(offlineExpenses);
          setDiary(offlineDiary);
          setLabor(offlineLabor);
          setInventory(offlineInventory);
        }
      } else {
        // Load from offline storage
        const offlineExpenses = await offlineStorage.getExpensesOffline();
        const offlineDiary = await offlineStorage.getDiaryOffline();
        const offlineLabor = await offlineStorage.getLaborOffline();
        const offlineInventory = await offlineStorage.getInventoryOffline();
        
        setExpenses(offlineExpenses);
        setDiary(offlineDiary);
        setLabor(offlineLabor);
        setInventory(offlineInventory);
      }
      
      setIsLoaded(true);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (!user || !isLoaded) return;
    
    // Save data to MongoDB whenever it changes (if online)
    const saveData = async () => {
      if (offlineStorage.isOnline()) {
        try {
          await fetch('/api/data', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ email: user.email, expenses, diary, labor, inventory })
          });
        } catch {
          console.log('Error saving data to server');
        }
      } else {
        // Save to offline storage when offline
        console.log('Offline: Data will be synced when online');
      }
    };
    saveData();
  }, [expenses, diary, labor, inventory, user, isLoaded]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online - syncing data');
      if (user) {
        await offlineStorage.syncDataToServer(user.email, user.token);
        // Reload data from server
        try {
          const response = await fetch(`/api/data/${user.email}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          const data = await response.json();
          setExpenses(data.expenses || []);
          setDiary(data.diary || []);
          setLabor(data.labor || []);
          setInventory(data.inventory || []);
        } catch (err) {
          console.log('Error reloading data after sync', err);
        }
      }
    };

    const handleOffline = () => {
      console.log('Gone offline - using local storage');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

const exportFullReport = () => {
    exportAllDataPDF(expenses, diary, labor, inventory);
  };

  const tabs = [
    { id: 'dashboard', name: t('dashboard.title', 'Dashboard'), icon: LayoutDashboard },
    { id: 'expenses', name: t('expenses.title', 'Expense Tracking'), icon: IndianRupee },
    { id: 'diary', name: t('diary.title', 'Farm Diary & Yield Records'), icon: BookOpen },
    { id: 'tasks', name: t('tasks.title', 'Task Scheduling'), icon: Clock },
    { id: 'labor', name: t('labor.title', 'Labor & Khata'), icon: Users },
    { id: 'inventory', name: t('inventory.title', 'Inventory & Supply Tracking'), icon: Package }
  ];

  // If user is not logged in, show Login page instead of Dashboard
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      {/* Header */}
      <header className="bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg pt-2 pb-2 md:pt-1 md:pb-5 lg:pt-0 lg:pb-6 px-2 sm:px-6 mb-2 sm:mb-4 md:mb-8 lg:mb-10 z-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-0">
            <div className="flex flex-col items-center -mt-8  sm:-mt-6 md:-mt-10 lg:-mt-14 -mb-2 sm:-mb-4 md:-mb-6">
              <img src={logo} alt="Farm Logo" className="w-50 sm:w-64 md:w-80 lg:w-96 -mb-3  h-auto object-contain drop-shadow-xl relative z-10 " />
              <p className="-mt-9 mb-4   sm:-mt-10 md:-mt-14 lg:-mt-18 mb-10 text-white font-serif italic text-[11px] sm:text-sm md:text-base lg:text-lg font-bold tracking-widest text-center drop-shadow-md px-2 z-20 relative ">{t('common.tagline', 'हर किसान का डिजिटल साथी')}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center z-20 mt-1 md:mt-0">
              <WeatherWidget />
              <LanguageSwitcher />
              <ThemeSwitcher />
              {/* Online/Offline Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                offlineStorage.isOnline() 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  offlineStorage.isOnline() ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {offlineStorage.isOnline() ? 'Online' : 'Offline'}
              </div>
              <button 
                onClick={() => {
                  setUser(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm shadow"
              >
                {t('common.logout', 'Logout')}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow overflow-x-auto">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center">
          <div className="flex w-full lg:w-auto overflow-x-auto hide-scrollbar">
            {tabs.map(t => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)}
                className={`flex items-center px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base font-medium transition whitespace-nowrap dark:text-gray-300 ${
                  tab === t.id 
                    ? 'border-b-4 border-green-600 text-green-700 dark:text-green-400' 
                    : 'text-gray-600 hover:text-green-600 dark:hover:text-green-400'
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
              onClick={exportFullReport} 
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md font-semibold"
              title={t('export.fullReport', 'Download All Reports')}
            >
              <FileDown className="w-4 h-4 mr-2" />
              <span>{t('export.fullReport', 'Full Report')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-3 sm:p-6">
        {tab === 'dashboard' && <Dashboard user={user} expenses={expenses} inventory={inventory} labor={labor} diary={diary} />}
        {tab === 'expenses' && <Expenses data={expenses} setData={setExpenses} />}
        {tab === 'diary' && <Diary data={diary} setData={setDiary} />}
        {tab === 'tasks' && <Labor data={labor} setData={setLabor} />}
        {tab === 'labor' && <LaborManagement user={user} />}
        {tab === 'inventory' && <Inventory data={inventory} setData={setInventory} />}
      </main>
    </div>
  );
} 