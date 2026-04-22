import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { IndianRupee, Package, Users, Sprout, Calendar, TrendingUp, CheckCircle, Clock, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import api from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

export default function Dashboard({ user, expenses, inventory, labor, diary }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Date range filter state
  const [dateRange, setDateRange] = useState('30'); // '7', '30', '90', 'all'
  
  // Fetch Workers for Khata Summary
  const [workers, setWorkers] = useState([]);
  
  useEffect(() => {
    if (user?.email) {
      api.get(`/api/workers/${user.email}`)
        .then(res => setWorkers(res.data))
        .catch(err => console.error("Error fetching workers:", err));
    }
  }, [user]);

  const totalAdvance = workers.reduce((sum, w) => sum + (Number(w.advanceBalance) || 0), 0);

  // Filter data based on date range
  const filteredExpenses = useMemo(() => {
    if (dateRange === 'all') return expenses;
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return expenses.filter(exp => new Date(exp.date) >= cutoffDate);
  }, [expenses, dateRange]);
  
  const filteredDiary = useMemo(() => {
    if (dateRange === 'all') return diary;
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return diary.filter(entry => new Date(entry.date) >= cutoffDate);
  }, [diary, dateRange]);
  
  const filteredLabor = useMemo(() => {
    if (dateRange === 'all') return labor;
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return labor.filter(task => new Date(task.date) >= cutoffDate);
  }, [labor, dateRange]);

  // Prepare Expense Data (Group by Category)
  const expenseByCategory = filteredExpenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.cat);
    const amount = parseFloat(curr.amt) || 0;
    if (existing) {
      existing.value += amount;
    } else {
      acc.push({ name: curr.cat, value: amount });
    }
    return acc;
  }, []);

  // Prepare Expense Trend Data (Daily expenses over time)
  const expenseTrendData = useMemo(() => {
    const days = dateRange === 'all' ? 90 : parseInt(dateRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateInterval.map(date => {
      const dayExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === date.toDateString();
      });
      
      const total = dayExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amt) || 0), 0);
      
      return {
        date: format(date, 'MMM dd'),
        expenses: total,
        fullDate: date
      };
    });
  }, [filteredExpenses, dateRange]);

  // Prepare Yield Trend Data
  const yieldTrendData = useMemo(() => {
    const days = dateRange === 'all' ? 90 : parseInt(dateRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateInterval.map(date => {
      const dayEntries = filteredDiary.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === date.toDateString();
      });
      
      const totalYieldValue = dayEntries.reduce((sum, entry) => {
        const yieldValue = parseFloat(entry.yield) || 0;
        return sum + yieldValue;
      }, 0);
      
      return {
        date: format(date, 'MMM dd'),
        yield: totalYieldValue,
        entries: dayEntries.length
      };
    });
  }, [filteredDiary, dateRange]);

  // Prepare Inventory Data (Top 5 items for Bar Chart)
  const inventoryData = inventory.slice(0, 5).map(item => ({
    name: item.name,
    Stock: parseFloat(item.qty) || 0,
    Min: parseFloat(item.min) || 0
  }));

  // Calculate Totals for Summary Cards
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amt) || 0), 0);
  const pendingTasks = filteredLabor.filter(l => !l.done).length;
  const completedTasks = filteredLabor.filter(l => l.done).length;
  const totalTasks = filteredLabor.length;
  const lowStock = inventory.filter(i => (parseFloat(i.qty) || 0) <= (parseFloat(i.min) || 0)).length;
  const totalYield = filteredDiary.reduce((sum, entry) => sum + (parseFloat(entry.yield) || 0), 0);

  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #4b5563', color: '#fff' }
    : { backgroundColor: '#fff', border: '1px solid #ccc' };
  const legendStyle = theme === 'dark' ? { color: '#a0aec0' } : { color: '#333' };
  const tickStyle = { fill: theme === 'dark' ? '#a0aec0' : '#666' };
  const gridStyle = { stroke: theme === 'dark' ? '#4b5563' : '#e0e0e0' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.filterBy', 'Filter by:')}</span>
          </div>
          <div className="flex gap-2">
            {[
              { value: '7', label: t('dashboard.last7Days', 'Last 7 days') },
              { value: '30', label: t('dashboard.last30Days', 'Last 30 days') },
              { value: '90', label: t('dashboard.last90Days', 'Last 90 days') },
              { value: 'all', label: t('dashboard.allTime', 'All time') }
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1 text-sm rounded-lg transition ${
                  dateRange === range.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Enhanced Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><IndianRupee className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.totalExpenses', 'Total Expenses')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {filteredExpenses.length} transactions
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Package className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.lowStockItems', 'Low Stock Items')}</p>
              <p className="text-2xl font-bold text-red-500">{lowStock}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                of {inventory.length} items
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.pendingTasks', 'Pending Tasks')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{pendingTasks}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {completedTasks}/{totalTasks} completed
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Sprout className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.diaryEntries', 'Diary Entries')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{filteredDiary.length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Total yield: {totalYield.toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Expense Trend Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden min-w-0 w-full dark:shadow-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('dashboard.expenseTrends', 'Expense Trends')}
          </h3>
          {expenseTrendData.some(d => d.expenses > 0) ? (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={expenseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStyle.stroke} />
                  <XAxis dataKey="date" tick={tickStyle} />
                  <YAxis tick={tickStyle} />
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Expenses']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              No expense data for selected period
            </div>
          )}
        </div>

        {/* Expense Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden min-w-0 w-full dark:shadow-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t('dashboard.expensesByCategory', 'Expenses by Category')}</h3>
          {expenseByCategory.length > 0 ? (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={{ fill: tickStyle.fill, fontSize: 12 }}>
                    {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend wrapperStyle={legendStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xl">{t('dashboard.noExpenseData', 'No expense data available')}</div>
          )}
        </div>

        {/* Yield Trend Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden min-w-0 w-full dark:shadow-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            Yield Trends
          </h3>
          {yieldTrendData.some(d => d.yield > 0) ? (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={yieldTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStyle.stroke} />
                  <XAxis dataKey="date" tick={tickStyle} />
                  <YAxis tick={tickStyle} />
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    formatter={(value, name) => name === 'yield' ? [`${value.toFixed(1)} kg`, 'Yield'] : [value, 'Entries']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend wrapperStyle={legendStyle} />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              No yield data for selected period
            </div>
          )}
        </div>

        {/* Inventory Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden min-w-0 w-full dark:shadow-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t('dashboard.inventoryStock', 'Inventory Stock vs Min Required')}</h3>
          {inventoryData.length > 0 ? (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStyle.stroke} />
                  <XAxis dataKey="name" tick={tickStyle} />
                  <YAxis tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={legendStyle} />
                  <Bar dataKey="Stock" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Min" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xl">{t('dashboard.noInventoryData', 'No inventory data available')}</div>
          )}
        </div>
      </div>

      {/* Labor & Worker Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 w-full">
        {/* 1. Old Labor Task Progress Section */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 dark:shadow-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t('dashboard.laborTaskProgress', 'Labor Task Progress')}
          </h3>
        {filteredLabor.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.pending', 'Pending')}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
              </div>
            </div>
            <div className="space-y-2">
              {filteredLabor.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {task.done ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{task.task}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{task.worker} • {task.date}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {task.hours}h
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            No labor tasks for selected period
          </div>
        )}
      </div>

      {/* 2. New Worker Khata Summary Section */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 dark:shadow-gray-900">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Worker & Khata Overview
        </h3>
        {workers.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{workers.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Workers</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totalAdvance}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Advance (Khata)</div>
              </div>
            </div>
            <div className="space-y-2">
              {workers.slice(0, 5).map(w => (
                <div key={w._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-white">{w.name}</span>
                    {w.todayAttendance && (
                      <span className={`text-xs font-bold ${w.todayAttendance === 'Present' ? 'text-green-500' : w.todayAttendance === 'Absent' ? 'text-red-500' : 'text-yellow-500'}`}>
                        Today: {w.todayAttendance}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-800/30">
                    ₹{w.advanceBalance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            No workers added yet
          </div>
        )}
      </div>
    </div>
  </div>
  );
}