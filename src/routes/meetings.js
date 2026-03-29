const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendMeetingUpdatedEmail, sendMeetingCancelledEmail } = require('../services/emailService');
const { mutationLimiter } = require('../middleware/rateLimit');

function parseDateTimeOrNull(date, time) {
  if (typeof date !== 'string' || typeof time !== 'string') {
    return null;
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;

  const dateTime = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  if (
    dateTime.getUTCFullYear() !== year ||
    dateTime.getUTCMonth() !== month - 1 ||
    dateTime.getUTCDate() !== day
  ) {
    return null;
  }

  return dateTime;
}

// GET /api/meetings?type=upcoming|past
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date().toISOString();

    let query;
    if (type === 'past') {
      query = `
        SELECT b.*, e.name as event_type_name, e.duration, e.color, e.slug
        FROM bookings b JOIN event_types e ON b.event_type_id = e.id
        WHERE b.start_time < ? AND b.status = 'active'
        ORDER BY b.start_time DESC
      `;
    } else {
      query = `
        SELECT b.*, e.name as event_type_name, e.duration, e.color, e.slug
        FROM bookings b JOIN event_types e ON b.event_type_id = e.id
        WHERE b.start_time >= ? AND b.status = 'active'
        ORDER BY b.start_time ASC
      `;
    }

    const meetings = await db.all(query, [now]);
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meetings/:id
router.get('/:id', mutationLimiter, async (req, res) => {
  try {
    const meeting = await db.get(
      `SELECT b.*, e.name as event_type_name, e.duration, e.color, e.slug
       FROM bookings b JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/meetings/:id - reschedule or update notes
router.put('/:id', mutationLimiter, async (req, res) => {
  try {
    const { date, time, notes } = req.body;
    if (!date || !time) {
      return res.status(400).json({ error: 'date and time are required' });
    }

    const meeting = await db.get(
      `SELECT b.*, e.name as event_type_name, e.duration, e.color, e.slug, e.buffer_before, e.buffer_after
       FROM bookings b JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = ? AND b.status = 'active'`,
      [req.params.id]
    );

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const startTime = parseDateTimeOrNull(date, time);
    if (!startTime) {
      return res.status(400).json({ error: 'Invalid date or time format' });
    }
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);

    const bufferBefore = (meeting.buffer_before || 0) * 60000;
    const bufferAfter = (meeting.buffer_after || 0) * 60000;

    const overlap = await db.get(
      `SELECT id FROM bookings
       WHERE id != ?
       AND status = 'active'
       AND start_time < ? AND end_time > ?`,
      [req.params.id, new Date(endTime.getTime() + bufferAfter).toISOString(), new Date(startTime.getTime() - bufferBefore).toISOString()]
    );

    if (overlap) {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }

    const dayOfWeek = startTime.getDay();
    let avail = await db.get('SELECT * FROM date_specific_availability WHERE date = ? AND is_active = 1', [date]);
    if (!avail) {
      avail = await db.get('SELECT * FROM availability WHERE day_of_week = ? AND is_active = 1', [dayOfWeek]);
    }

    if (!avail) {
      return res.status(400).json({ error: 'No availability on this day' });
    }

    await db.run(
      `UPDATE bookings
       SET start_time = ?, end_time = ?, notes = ?
       WHERE id = ?`,
      [startTime.toISOString(), endTime.toISOString(), notes || '', req.params.id]
    );

    const updatedMeeting = await db.get(
      `SELECT b.*, e.name as event_type_name, e.duration, e.color, e.slug
       FROM bookings b JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    // Send email in background without blocking response
    sendMeetingUpdatedEmail(updatedMeeting, meeting.start_time, meeting.end_time).catch(err => {
      console.error('Background email send failed:', err.message);
    });
    res.json(updatedMeeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/meetings/:id - cancel a meeting
router.delete('/:id', mutationLimiter, async (req, res) => {
  try {
    const meeting = await db.get(
      `SELECT b.*, e.name as event_type_name, e.duration, e.color, e.slug
       FROM bookings b JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    await db.run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    
    // Send email in background without blocking response
    sendMeetingCancelledEmail(meeting).catch(err => {
      console.error('Background email send failed:', err.message);
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
