import React, { useState, useEffect } from "react";
import api from "../api";
import { Users, IndianRupee, Plus, CheckCircle, XCircle, Wallet, Search, FileDown, Download, Edit2, Trash2, CalendarDays, Calculator } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function LaborManagement({ user }) {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyWage, setDailyWage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' or 'register'
  const [monthlyData, setMonthlyData] = useState({}); // Stores full month attendance from backend

  // Actual logged-in user email and dynamic URL
  const ownerEmail = user?.email || "admin@farm.com"; 

  const [searchTerm, setSearchTerm] = useState("");

  // Calculate total advance for the summary card
  const totalAdvance = workers.reduce((sum, worker) => sum + (Number(worker.advanceBalance) || 0), 0);

  // Date calculations for the Monthly Register (Excel view)
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayDay = currentDate.getDate();

  // 1. Fetch Workers on Page Load
  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get(`/api/workers/${ownerEmail}`);
      setWorkers(response.data);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  // Fetch monthly data automatically when switching to Monthly Register
  useEffect(() => {
    if (activeTab === "register" && workers.length > 0) {
      const loadMonthlyData = async () => {
        const data = {};
        for (let w of workers) {
          try {
            const response = await api.get(`/api/workers/${w._id}/summary`);
            data[w._id] = response.data;
          } catch (error) {
            console.error("Error fetching summary for", w.name);
          }
        }
        setMonthlyData(data);
      };
      loadMonthlyData();
    }
  }, [activeTab, workers]);

  // 2. Add New Worker
  const handleAddWorker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/api/workers/${editId}`, {
          name,
          phone,
          dailyWage: Number(dailyWage)
        });
        toast.success("Worker updated successfully!");
        setEditId(null);
      } else {
        await api.post(`/api/workers`, {
          ownerEmail,
          name,
          phone,
          dailyWage: Number(dailyWage)
        });
        toast.success("Worker added successfully!");
      }
      setName("");
      setPhone("");
      setDailyWage("");
      fetchWorkers(); // Refresh the list
    } catch (error) {
      console.error("Error adding worker:", error);
      toast.error(`Failed to add worker: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  // 3. Mark Attendance & Add Advance
  const handleAttendance = async (workerId, status) => {
    const advanceStr = prompt(`Enter advance payment for this worker today (Leave 0 if none):`, "0");
    if (advanceStr === null) return; // User cancelled
    
    const advancePaid = Number(advanceStr) || 0;
    const date = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    try {
      await api.post(`/api/attendance`, {
        ownerEmail,
        workerId,
        date,
        status,
        advancePaid,
        notes: ""
      });
      toast.success(`Attendance marked as ${status} with ₹${advancePaid} advance.`);
      fetchWorkers(); // Refresh list to see updated Khata balance
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error(`Failed to mark attendance: ${error.response?.data?.error || error.message}`);
    }
  };

  // Frontend Filter
  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.phone && w.phone.includes(searchTerm))
  );

  // Export functions (UI functionality)
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Labor & Khata Report", 14, 20);
    doc.setFontSize(12);
    let y = 30;
    workers.forEach((w, index) => {
      doc.text(`${index + 1}. Name: ${w.name} | Phone: ${w.phone || 'N/A'} | Wage: Rs.${w.dailyWage} | Advance: Rs.${w.advanceBalance}`, 14, y);
      y += 10;
    });
    doc.save("workers_khata.pdf");
  };

  const exportCSV = () => {
    let csvContent = 'Name,Phone,Daily Wage,Advance Balance\n';
    workers.forEach(w => {
      csvContent += `"${w.name}","${w.phone || ''}",${w.dailyWage},${w.advanceBalance}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'workers_khata.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Placeholders for future backend functionality
  const handleEdit = (worker) => {
    setName(worker.name);
    setPhone(worker.phone || "");
    setDailyWage(worker.dailyWage);
    setEditId(worker._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => { 
    if(window.confirm("Are you sure you want to delete this worker?")) {
      try {
        await api.delete(`/api/workers/${id}`);
        fetchWorkers();
      } catch (error) {
        console.error("Error deleting worker:", error);
      }
    }
  };

  // Settle Account directly from Monthly Register
  const handleInlineSettle = async (worker) => {
    if (window.confirm(`Are you sure you want to settle the account for ${worker.name}? This will save the record and reset their Khata Advance to ₹0.`)) {
      try {
        await api.post(`/api/workers/${worker._id}/settle`);
        toast.success("Account settled successfully!");
        fetchWorkers(); // Refresh data
      } catch (error) {
        toast.error("Failed to settle account");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl flex items-center min-h-[auto] sm:min-h-[16rem]">
        <img
          src="https://images.unsplash.com/photo-1592982537447-6f296d9e68c6?w=1200&h=400&fit=crop"
          alt="Labor Management"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full bg-gradient-to-r from-teal-900/90 to-teal-700/70 py-4 sm:py-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold">{t('laborMgmt.title', 'Labor & Khata Management')}</h2>
                <p className="text-teal-100 text-sm sm:text-lg mt-0 sm:mt-1">{t('laborMgmt.subtitle', 'Manage your workforce attendance and advance payments')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-teal-100 text-sm">{t('laborMgmt.totalWorkers', 'Total Workers')}</p>
                <p className="text-3xl font-bold mt-1">{workers.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/30">
                <p className="text-teal-100 text-sm">{t('laborMgmt.totalAdvance', 'Total Advance (Khata)')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <IndianRupee className="w-6 h-6" />
                  <span className="text-3xl font-bold">{totalAdvance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Worker Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 border-2 border-teal-100 dark:border-teal-800">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" />
          {editId ? t('laborMgmt.editWorker', 'Edit Worker') : t('laborMgmt.addWorker', 'Add New Worker')}
        </h3>
        <form onSubmit={handleAddWorker} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('laborMgmt.workerName', 'Worker Name')}</label>
            <input
              type="text"
              placeholder="e.g., Ramu"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-teal-500 focus:outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('laborMgmt.phone', 'Phone (Optional)')}</label>
            <input
              type="text"
              placeholder="e.g., 9876543210"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-teal-500 focus:outline-none transition"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('laborMgmt.dailyWage', 'Daily Wage (₹)')}</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <IndianRupee className="w-5 h-5" />
              </div>
              <input
                type="number"
                placeholder="300"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-teal-500 focus:outline-none transition"
                value={dailyWage}
                onChange={(e) => setDailyWage(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 rounded-lg hover:from-teal-700 hover:to-teal-600 transition shadow-md flex items-center justify-center font-medium disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              {loading ? t('common.saving', 'Saving...') : (editId ? t('laborMgmt.updateWorkerBtn', 'Update Worker') : t('laborMgmt.addWorkerBtn', 'Add Worker'))}
            </button>
          </div>
        </form>
      </div>

      {/* Workers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-teal-600" />
            {t('laborMgmt.yourWorkers', 'Your Workers')}
          </h3>
          {/* Tabs for switching views */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-full sm:w-auto">
            <button onClick={() => setActiveTab("daily")} className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === "daily" ? "bg-white dark:bg-gray-800 shadow text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              <CheckCircle className="w-4 h-4" />
              {t('laborMgmt.dailyKhata', 'Daily Khata')}
            </button>
            <button onClick={() => setActiveTab("register")} className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === "register" ? "bg-white dark:bg-gray-800 shadow text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              <CalendarDays className="w-4 h-4" />
              {t('laborMgmt.monthlyRegister', 'Monthly Register')}
            </button>
          </div>
        </div>
        
        {/* Search and Export Bar */}
        {workers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder={t('laborMgmt.searchPlaceholder', 'Search workers by name or phone...')} 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:border-teal-500 focus:outline-none transition shadow-sm" 
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportPDF} 
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-md"
                title="Export to PDF"
              >
                <FileDown className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">PDF</span>
              </button>
              <button 
                onClick={exportCSV} 
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                title="Export to CSV"
              >
                <Download className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">CSV</span>
              </button>
            </div>
          </div>
        )}

        {workers.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-teal-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('laborMgmt.noWorkers', 'No workers added yet.')}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('laborMgmt.addFirst', 'Add your first worker using the form above.')}</p>
          </div>
        ) : (
          <>
          {activeTab === "daily" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm sm:text-base">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 rounded-tl-lg whitespace-nowrap">{t('laborMgmt.namePhone', 'Name & Phone')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('laborMgmt.dailyWage', 'Daily Wage')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">{t('laborMgmt.advanceKhata', 'Advance (Khata)')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('laborMgmt.markAttendance', 'Mark Attendance')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200 rounded-tr-lg whitespace-nowrap">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No matching workers found.
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => (
                  <tr key={worker._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-800 dark:text-white text-base">{worker.name}</div>
                      {worker.phone && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{worker.phone}</div>}
                    </td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">₹{worker.dailyWage}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-800/30">
                        ₹{worker.advanceBalance}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {worker.todayAttendance ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${worker.todayAttendance === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'}`}>
                          {worker.todayAttendance === 'Present' ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                          {worker.todayAttendance}
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAttendance(worker._id, 'Present')} 
                            className="flex items-center bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 px-3 py-2 rounded-lg font-medium transition" title="Present"
                          >
                            <CheckCircle className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">{t('laborMgmt.present', 'Present')}</span>
                          </button>
                          <button 
                            onClick={() => handleAttendance(worker._id, 'Absent')} 
                            className="flex items-center bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 px-3 py-2 rounded-lg font-medium transition" title="Absent"
                          >
                            <XCircle className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">{t('laborMgmt.absent', 'Absent')}</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setActiveTab("register")} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-gray-700" title="View in Monthly Register">
                          <Calculator className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleEdit(worker)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700" title="Edit">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(worker._id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          ) : (
          /* Excel-like Monthly Register View */
          <div className="overflow-x-auto pb-4">
            <table className="min-w-full table-auto border-collapse border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-left font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{t('laborMgmt.workerName', 'Worker Name')}</th>
                  {daysArray.map(day => (
                    <th key={day} className={`px-2 py-3 border border-gray-200 dark:border-gray-600 font-semibold text-center min-w-[40px] ${day === todayDay ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-400' : 'text-gray-700 dark:text-gray-200'}`}>
                      {day}
                    </th>
                  ))}
                  <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{t('laborMgmt.daysPresent', 'Days (P)')}</th>
                  <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('laborMgmt.earned', 'Earned')}</th>
                  <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">{t('laborMgmt.advance', 'Advance')}</th>
                  <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center font-semibold text-teal-600 dark:text-teal-400 whitespace-nowrap">{t('laborMgmt.netPay', 'Net Pay')}</th>
                  <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('common.actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkers.map(worker => {
                  const mData = monthlyData[worker._id] || {};
                  const attendances = mData.attendances || [];
                  
                  const dayStatus = {};
                  attendances.forEach(a => {
                    const d = parseInt(a.date.split('-')[2], 10);
                    dayStatus[d] = a.status === 'Present' ? 'P' : a.status === 'Absent' ? 'A' : 'H';
                  });
                  
                  const presentCount = mData.presentCount || 0;
                  const earned = presentCount * worker.dailyWage;
                  const advance = worker.advanceBalance || 0;
                  const netPay = earned - advance;

                  return (
                  <tr key={worker._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-bold text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {worker.name}
                    </td>
                    {daysArray.map(day => {
                      const status = dayStatus[day] || "-";
                      const statusColor = status === 'P' ? 'text-green-600 dark:text-green-400 font-bold' : status === 'A' ? 'text-red-600 dark:text-red-400 font-bold' : status === 'H' ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-400 dark:text-gray-500';
                      return <td key={day} className={`px-2 py-3 border border-gray-200 dark:border-gray-600 text-center ${day === todayDay ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''} ${statusColor}`}>{status}</td>;
                    })}
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-bold text-green-600 dark:text-green-400 text-center bg-green-50/50 dark:bg-green-900/10 whitespace-nowrap">{presentCount}</td>
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 text-center whitespace-nowrap">₹{earned}</td>
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-bold text-red-500 dark:text-red-400 text-center whitespace-nowrap">₹{advance}</td>
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-bold text-teal-600 dark:text-teal-400 text-center bg-teal-50/50 dark:bg-teal-900/10 whitespace-nowrap">₹{netPay}</td>
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center whitespace-nowrap">
                      <button onClick={() => handleInlineSettle(worker)} className="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-teal-700 transition shadow-sm font-medium">{t('laborMgmt.settleKhata', 'Settle Khata')}</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}

export default LaborManagement;
