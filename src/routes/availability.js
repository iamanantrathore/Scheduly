const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// GET /api/availability
router.get('/', async (req, res) => {
  try {
    const availability = await db.all('SELECT * FROM availability ORDER BY day_of_week');
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/availability - replace all availability settings
router.put('/', async (req, res) => {
  try {
    const { availability, timezone } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'availability must be an array' });
    }

    await db.run('BEGIN TRANSACTION');
    await db.run('DELETE FROM availability');

    const insertSql = 'INSERT INTO availability (id, day_of_week, start_time, end_time, is_active, timezone) VALUES (?, ?, ?, ?, ?, ?)';
    for (const item of availability) {
      await db.run(insertSql, [
        item.id || uuidv4(),
        item.day_of_week,
        item.start_time,
        item.end_time,
        item.is_active ? 1 : 0,
        timezone || 'UTC',
      ]);
    }

    await db.run('COMMIT');

    const updated = await db.all('SELECT * FROM availability ORDER BY day_of_week');
    res.json(updated);
  } catch (err) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
