require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT || 3002);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/event-types', require('./routes/eventTypes'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/date-availability', require('./routes/dateAvailability'));
app.use('/api/booking', require('./routes/bookings'));
app.use('/api/meetings', require('./routes/meetings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Run seed on startup if DB is empty
const db = require('./database');
const { seed } = require('./seed');

function autoSeed() {
  db.get('SELECT COUNT(*) as c FROM event_types', [])
    .then(count => {
      if (!count || count.c === 0) {
        console.log('Auto-seeding database...');
        return seed();
      }
    })
    .catch(err => {
      console.error('Auto-seed failed:', err.message);
    });
}

autoSeed();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
