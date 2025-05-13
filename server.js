const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sydney-events', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Email Schema
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  eventId: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});
const Email = mongoose.model('Email', emailSchema);

// POST route to save email
app.post('/api/email', async (req, res) => {
  const { email, eventId } = req.body;
  if (!email || !eventId) {
    return res.status(400).json({ message: 'Missing email or eventId' });
  }

  try {
    await Email.create({ email, eventId });
    res.status(200).json({ message: 'Email saved successfully' });
  } catch (err) {
    console.error('Error saving email:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
