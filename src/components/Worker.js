const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  ownerEmail: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  dailyWage: { type: Number, required: true },
  advanceBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Yeh line sabse important hai
module.exports = mongoose.model('Worker', workerSchema);
