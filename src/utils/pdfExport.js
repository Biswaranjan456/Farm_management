import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Export Expenses to PDF
export const exportExpensesPDF = (expenses) => {
  const doc = new jsPDF();
  
  // Add Title
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // Green color
  doc.text('Farm Expenses Report', 14, 20);
  
  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 28);
  
  // Calculate total
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amt || 0), 0);
  
  // Add Summary
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Expenses: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 38);
  doc.text(`Total Transactions: ${expenses.length}`, 14, 45);
  
  // Prepare table data
  const tableData = expenses.map(e => [
    formatDate(e.date),
    e.cat,
    e.desc,
    `₹${parseFloat(e.amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  ]);
  
  // Add table
  doc.autoTable({
    startY: 52,
    head: [['Date', 'Category', 'Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [22, 163, 74], // Green
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' }
    },
    foot: [[
      '', '', 'Total:', 
      `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]],
    footStyles: {
      fillColor: [240, 253, 244],
      textColor: [22, 163, 74],
      fontStyle: 'bold',
      fontSize: 11
    }
  });
  
  // Save PDF
  doc.save(`Farm_Expenses_${Date.now()}.pdf`);
};

// Export Diary to PDF
export const exportDiaryPDF = (diary) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('Farm Diary & Yield Records', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 28);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Entries: ${diary.length}`, 14, 38);
  
  const tableData = diary.map(d => [
    formatDate(d.date),
    d.activity,
    d.crop,
    d.yield || '-',
    d.notes || '-'
  ]);
  
  doc.autoTable({
    startY: 45,
    head: [['Date', 'Activity', 'Crop/Field', 'Yield', 'Notes']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235], // Blue
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      4: { cellWidth: 60 }
    }
  });
  
  doc.save(`Farm_Diary_${Date.now()}.pdf`);
};

// Export Labor Schedule to PDF
export const exportLaborPDF = (labor) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(147, 51, 234); // Purple color
  doc.text('Labor & Resource Schedule', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 28);
  
  const completed = labor.filter(l => l.done).length;
  const pending = labor.length - completed;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Tasks: ${labor.length}`, 14, 38);
  doc.text(`Completed: ${completed} | Pending: ${pending}`, 14, 45);
  
  const tableData = labor.map(l => [
    formatDate(l.date),
    l.worker,
    l.task,
    `${l.hours} hrs`,
    l.done ? 'Completed' : 'Scheduled'
  ]);
  
  doc.autoTable({
    startY: 52,
    head: [['Date', 'Worker', 'Task', 'Hours', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [147, 51, 234], // Purple
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      4: { 
        halign: 'center',
        fontStyle: 'bold'
      }
    },
    didParseCell: function (data) {
      if (data.column.index === 4 && data.cell.section === 'body') {
        if (data.cell.raw === 'Completed') {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        } else {
          data.cell.styles.textColor = [234, 179, 8]; // Yellow
        }
      }
    }
  });
  
  doc.save(`Labor_Schedule_${Date.now()}.pdf`);
};

// Export Inventory to PDF
export const exportInventoryPDF = (inventory) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // Indigo color
  doc.text('Inventory & Supply Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 28);
  
  const lowStock = inventory.filter(i => parseFloat(i.qty) <= parseFloat(i.min)).length;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Items: ${inventory.length}`, 14, 38);
  doc.text(`Low Stock Alerts: ${lowStock}`, 14, 45);
  
  const tableData = inventory.map(i => {
    const isLowStock = parseFloat(i.qty) <= parseFloat(i.min);
    return [
      i.name,
      i.cat,
      `${i.qty} ${i.unit}`,
      `${i.min} ${i.unit}`,
      isLowStock ? '⚠️ LOW' : '✓ OK'
    ];
  });
  
  doc.autoTable({
    startY: 52,
    head: [['Item', 'Category', 'Current Stock', 'Min Stock', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241], // Indigo
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      4: { 
        halign: 'center',
        fontStyle: 'bold'
      }
    },
    didParseCell: function (data) {
      if (data.column.index === 4 && data.cell.section === 'body') {
        if (data.cell.raw.includes('LOW')) {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fillColor = [254, 226, 226]; // Light red bg
        } else {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        }
      }
    }
  });
  
  doc.save(`Inventory_Report_${Date.now()}.pdf`);
};

// Export All Data (Comprehensive Report)
export const exportAllDataPDF = (expenses, diary, labor, inventory) => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Title Page
  doc.setFontSize(24);
  doc.setTextColor(22, 163, 74);
  doc.text('Farm Management', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(18);
  doc.text('Complete Report', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDate(new Date())}`, 105, yPos, { align: 'center' });
  
  // Summary
  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Summary', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amt || 0), 0);
  doc.text(`• Total Expenses: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, yPos);
  yPos += 7;
  doc.text(`• Diary Entries: ${diary.length}`, 20, yPos);
  yPos += 7;
  doc.text(`• Labor Tasks: ${labor.length} (${labor.filter(l => !l.done).length} pending)`, 20, yPos);
  yPos += 7;
  doc.text(`• Inventory Items: ${inventory.length}`, 20, yPos);
  
  // Expenses Section
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74);
  doc.text('Expenses', 14, yPos);
  
  const expenseData = expenses.slice(0, 20).map(e => [
    formatDate(e.date),
    e.cat,
    e.desc,
    `₹${parseFloat(e.amt).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: yPos + 5,
    head: [['Date', 'Category', 'Description', 'Amount']],
    body: expenseData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }
  });
  
  // Inventory Section
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(99, 102, 241);
  doc.text('Inventory Status', 14, yPos);
  
  const inventoryData = inventory.map(i => [
    i.name,
    i.cat,
    `${i.qty} ${i.unit}`,
    parseFloat(i.qty) <= parseFloat(i.min) ? '⚠️ LOW' : '✓ OK'
  ]);
  
  doc.autoTable({
    startY: yPos + 5,
    head: [['Item', 'Category', 'Stock', 'Status']],
    body: inventoryData,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241] }
  });
  
  doc.save(`Farm_Complete_Report_${Date.now()}.pdf`);
};