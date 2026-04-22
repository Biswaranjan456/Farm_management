const express = require('express');
const router = express.Router();
const Worker = require('./Worker');
const Attendance = require('./Attendance');

// 1. Naya Worker Add Karne Ki API
router.post('/workers', async (req, res) => {
  try {
    const { ownerEmail, name, phone, dailyWage } = req.body;
    
    const newWorker = new Worker({ ownerEmail, name, phone, dailyWage });
    await newWorker.save();
    
    res.status(201).json({ message: "Worker added successfully!", worker: newWorker });
  } catch (error) {
    console.error("Error adding worker:", error);
    res.status(500).json({ message: "Failed to add worker", error: error.message });
  }
});

// 2. Owner Ke Saare Workers Fetch Karne Ki API
router.get('/workers/:email', async (req, res) => {
  try {
    const ownerEmail = req.params.email;
    // .lean() is used to return plain javascript objects
    const workers = await Worker.find({ ownerEmail, isActive: true }).lean();
    
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const workersWithAttendance = await Promise.all(workers.map(async (worker) => {
      const attendance = await Attendance.findOne({ workerId: worker._id, date: today });
      return {
        ...worker,
        todayAttendance: attendance ? attendance.status : null
      };
    }));

    res.status(200).json(workersWithAttendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workers", error: error.message });
  }
});

// 3. Attendance Lagane Aur Khata (Advance) Update Karne Ki API
router.post('/attendance', async (req, res) => {
  try {
    const { ownerEmail, workerId, date, status, advancePaid, notes } = req.body;

    // Pehle Attendance save karein
    const newAttendance = new Attendance({
      ownerEmail, workerId, date, status, advancePaid, notes
    });
    await newAttendance.save();

    // KHATA MAGIC: Agar advance diya hai, toh Worker ka advanceBalance badha do
    if (advancePaid > 0) {
      await Worker.findByIdAndUpdate(workerId, {
        $inc: { advanceBalance: advancePaid }
      });
    }

    res.status(201).json({ message: "Attendance marked successfully!", attendance: newAttendance });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark attendance", error: error.message });
  }
});

// 4. Update Worker (Edit) API
router.put('/workers/:id', async (req, res) => {
  try {
    const { name, phone, dailyWage } = req.body;
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      { name, phone, dailyWage },
      { new: true }
    );
    res.status(200).json({ message: "Worker updated successfully!", worker: updatedWorker });
  } catch (error) {
    res.status(500).json({ message: "Failed to update worker", error: error.message });
  }
});

// 5. Delete Worker API (Soft Delete)
router.delete('/workers/:id', async (req, res) => {
  try {
    await Worker.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ message: "Worker deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete worker", error: error.message });
  }
});

// 6. Get Monthly Summary (Hisaab) for a Worker
router.get('/workers/:id/summary', async (req, res) => {
  try {
    const workerId = req.params.id;
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    // Find all attendance for this worker in the current month
    const attendances = await Attendance.find({
      workerId,
      date: { $regex: `^${currentMonth}` }
    });

    let presentCount = 0;
    let absentCount = 0;

    attendances.forEach(record => {
      if (record.status === 'Present') presentCount++;
      else if (record.status === 'Absent') absentCount++;
    });

    res.status(200).json({ presentCount, absentCount, attendances });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary", error: error.message });
  }
});

// 7. Settle Khata (Clear Advance & Reset)
router.post('/workers/:id/settle', async (req, res) => {
  try {
    const workerId = req.params.id;
    await Worker.findByIdAndUpdate(workerId, { advanceBalance: 0 }); // Khata 0 kar diya
    res.status(200).json({ message: "Account settled successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to settle account", error: error.message });
  }
});

// YEH LINE SABSE ZAROORI HAI JO ERROR DE RAHI THI
module.exports = router;
