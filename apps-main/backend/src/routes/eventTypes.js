const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// GET /api/event-types
router.get('/', async (req, res) => {
  try {
    const eventTypes = await db.all('SELECT * FROM event_types ORDER BY created_at DESC');
    res.json(eventTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/event-types/slug/:slug (must be before /:id)
router.get('/slug/:slug', async (req, res) => {
  try {
    const eventType = await db.get('SELECT * FROM event_types WHERE slug = ?', [req.params.slug]);
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });
    res.json(eventType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/event-types
router.post('/', async (req, res) => {
  try {
    const { name, duration, slug, description, color, buffer_before, buffer_after, custom_questions } = req.body;
    if (!name || !duration || !slug) {
      return res.status(400).json({ error: 'name, duration, and slug are required' });
    }
    const id = uuidv4();
    await db.run(
      'INSERT INTO event_types (id, name, duration, slug, description, color, buffer_before, buffer_after, custom_questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, duration, slug, description || '', color || '#0069ff', buffer_before || 0, buffer_after || 0, JSON.stringify(custom_questions || [])]
    );
    const created = await db.get('SELECT * FROM event_types WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/event-types/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, duration, slug, description, color, buffer_before, buffer_after, custom_questions } = req.body;
    const existing = await db.get('SELECT * FROM event_types WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Event type not found' });

    await db.run(
      `UPDATE event_types SET name = ?, duration = ?, slug = ?, description = ?, color = ?, buffer_before = ?, buffer_after = ?, custom_questions = ? WHERE id = ?`,
      [
        name || existing.name,
        duration || existing.duration,
        slug || existing.slug,
        description !== undefined ? description : existing.description,
        color || existing.color,
        buffer_before !== undefined ? buffer_before : existing.buffer_before,
        buffer_after !== undefined ? buffer_after : existing.buffer_after,
        custom_questions ? JSON.stringify(custom_questions) : existing.custom_questions,
        req.params.id,
      ]
    );
    const updated = await db.get('SELECT * FROM event_types WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/event-types/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM event_types WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Event type not found' });

    const bookingCountRow = await db.get('SELECT COUNT(*) as count FROM bookings WHERE event_type_id = ?', [req.params.id]);
    const bookingCount = bookingCountRow?.count || 0;
    if (bookingCount > 0) {
      return res.status(400).json({ error: 'Cannot delete event type with active bookings' });
    }

    await db.run('DELETE FROM event_types WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('FOREIGN KEY constraint')) {
      return res.status(409).json({ error: 'Cannot delete event type because it is referenced by bookings' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
