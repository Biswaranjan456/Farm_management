import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IndianRupee, Package, Users, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

export default function Dashboard({ expenses, inventory, labor, diary }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  // Prepare Expense Data (Group by Category)
  const expenseByCategory = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.cat);
    const amount = parseFloat(curr.amt) || 0;
    if (existing) {
      existing.value += amount;
    } else {
      acc.push({ name: curr.cat, value: amount });
    }
    return acc;
  }, []);

  // Prepare Inventory Data (Top 5 items for Bar Chart)
  const inventoryData = inventory.slice(0, 5).map(item => ({
    name: item.name,
    Stock: parseFloat(item.qty) || 0,
    Min: parseFloat(item.min) || 0
  }));

  // Calculate Totals for Summary Cards
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amt) || 0), 0);
  const pendingTasks = labor.filter(l => !l.done).length;
  const lowStock = inventory.filter(i => (parseFloat(i.qty) || 0) <= (parseFloat(i.min) || 0)).length;

  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #4b5563', color: '#fff' }
    : { backgroundColor: '#fff', border: '1px solid #ccc' };
  const legendStyle = theme === 'dark' ? { color: '#a0aec0' } : { color: '#333' };
  const tickStyle = { fill: theme === 'dark' ? '#a0aec0' : '#666' };
  const gridStyle = { stroke: theme === 'dark' ? '#4b5563' : '#e0e0e0' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><IndianRupee className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.totalExpenses', 'Total Expenses')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Package className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.lowStockItems', 'Low Stock Items')}</p>
              <p className="text-2xl font-bold text-red-500">{lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.pendingTasks', 'Pending Tasks')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{pendingTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition dark:shadow-gray-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Sprout className="w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.diaryEntries', 'Diary Entries')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{diary.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
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
    </div>
  );
}