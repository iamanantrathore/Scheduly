const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// GET /api/date-availability?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      // Get all date-specific availabilities
      const all = await db.all('SELECT * FROM date_specific_availability ORDER BY date DESC');
      return res.json(all);
    }
    
    const avail = await db.get('SELECT * FROM date_specific_availability WHERE date = ?', [date]);
    res.json(avail || { date, start_time: '', end_time: '', is_active: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/date-availability
router.post('/', async (req, res) => {
  try {
    const { date, start_time, end_time, is_active } = req.body;
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: 'date, start_time, and end_time are required' });
    }

    const id = uuidv4();
    await db.run(
      'INSERT INTO date_specific_availability (id, date, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)',
      [id, date, start_time, end_time, is_active ? 1 : 0]
    );

    const created = await db.get('SELECT * FROM date_specific_availability WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/date-availability/:date
router.put('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { start_time, end_time, is_active } = req.body;

    const existing = await db.get('SELECT * FROM date_specific_availability WHERE date = ?', [date]);
    
    if (existing) {
      await db.run(
        'UPDATE date_specific_availability SET start_time = ?, end_time = ?, is_active = ? WHERE date = ?',
        [start_time, end_time, is_active ? 1 : 0, date]
      );
    } else {
      const id = uuidv4();
      await db.run(
        'INSERT INTO date_specific_availability (id, date, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)',
        [id, date, start_time, end_time, is_active ? 1 : 0]
      );
    }

    const updated = await db.get('SELECT * FROM date_specific_availability WHERE date = ?', [date]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/date-availability/:date
router.delete('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    await db.run('DELETE FROM date_specific_availability WHERE date = ?', [date]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
