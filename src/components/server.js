const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// Add your actual MongoDB username and password here
const MONGO_URI = "mongodb+srv://farm_user:FarmPass_8260440037@backend-cluster.r4ssmgq.mongodb.net/farm-management?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Schema for Farm Data
const DataSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  expenses: { type: Array, default: [] },
  diary: { type: Array, default: [] },
  labor: { type: Array, default: [] },
  inventory: { type: Array, default: [] }
});
const FarmData = mongoose.model('FarmData', DataSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User is already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, "secret_farm_key", { expiresIn: "24h" });
    res.status(201).json({ email: newUser.email, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found, please register" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password!" });

    const token = jwt.sign({ id: user._id }, "secret_farm_key", { expiresIn: "24h" });
    res.status(200).json({ email: user.email, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------------------
// APIs TO SAVE/LOAD FARMER DATA
// ------------------------------------
app.get('/api/data/:email', async (req, res) => {
  try {
    const data = await FarmData.findOne({ email: req.params.email });
    if (data) {
      res.json(data);
    } else {
      res.json({ expenses: [], diary: [], labor: [], inventory: [] });
    }
  } catch (err) {
    res.status(500).json({ message: "Error loading data" });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const { email, expenses, diary, labor, inventory } = req.body;
    await FarmData.findOneAndUpdate(
      { email },
      { expenses, diary, labor, inventory },
      { upsert: true, new: true } // Upsert: Creates new if not exists, otherwise updates
    );
    res.json({ message: "Data saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving data" });
  }
});

const PORT = 5002; // Or any other available port
app.listen(PORT, () => {
  console.log(`🚀 Backend Server is running on port ${PORT}!`);
});