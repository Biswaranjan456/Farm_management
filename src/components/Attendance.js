const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  ownerEmail: { type: String, required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true }, // Worker model se linked
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Half-Day'], required: true },
  advancePaid: { type: Number, default: 0 },
  notes: { type: String, default: "" }
}, { timestamps: true });

// YEH LINE SABSE ZAROORI HAI ATTENDANCE SAVE KARNE KE LIYE
module.exports = mongoose.model('Attendance', attendanceSchema);
