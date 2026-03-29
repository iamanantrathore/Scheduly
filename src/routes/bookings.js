const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { mutationLimiter } = require('../middleware/rateLimit');

// GET /api/booking/:slug/slots?date=YYYY-MM-DD
router.get('/:slug/slots', async (req, res) => {
  try {
    const { slug } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

    const eventType = await db.get('SELECT * FROM event_types WHERE slug = ?', [slug]);
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Check for date-specific availability first
    let avail = await db.get('SELECT * FROM date_specific_availability WHERE date = ? AND is_active = 1', [date]);
    
    // Fall back to weekly availability if no date-specific override
    if (!avail) {
      avail = await db.get('SELECT * FROM availability WHERE day_of_week = ? AND is_active = 1', [dayOfWeek]);
    }

    if (!avail) return res.json({ slots: [] });

    const [startHour, startMin] = avail.start_time.split(':').map(Number);
    const [endHour, endMin] = avail.end_time.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = eventType.duration;

    const slots = [];
    for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      slots.push(`${h}:${min}`);
    }

    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const allDayBookings = await db.all(
      `SELECT start_time, end_time FROM bookings
       WHERE status = 'active'
       AND start_time >= ? AND start_time <= ?`,
      [dayStart, dayEnd]
    );

    const bufferBefore = (eventType.buffer_before || 0) * 60000;
    const bufferAfter = (eventType.buffer_after || 0) * 60000;

    const availableSlots = slots.filter((slot) => {
      const slotStartMs = new Date(`${date}T${slot}:00`).getTime();
      const slotEndMs = slotStartMs + duration * 60000;

      for (const booking of allDayBookings) {
        const bStart = new Date(booking.start_time).getTime();
        const bEnd = new Date(booking.end_time).getTime();
        // Check overlap with buffer time
        if (slotStartMs < bEnd + bufferAfter && slotEndMs + bufferAfter > bStart - bufferBefore) {
          return false;
        }
      }
      return true;
    });

    res.json({ slots: availableSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/booking/:slug - create a booking
router.post('/:slug', mutationLimiter, async (req, res) => {
  try {
    const { slug } = req.params;
    const { invitee_name, invitee_email, date, time, notes, custom_answers } = req.body;

    if (!invitee_name || !invitee_email || !date || !time) {
      return res.status(400).json({ error: 'invitee_name, invitee_email, date, and time are required' });
    }

    const eventType = await db.get('SELECT * FROM event_types WHERE slug = ?', [slug]);
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000);

    const bufferBefore = (eventType.buffer_before || 0) * 60000;
    const bufferAfter = (eventType.buffer_after || 0) * 60000;

    const overlap = await db.get(
      `SELECT id FROM bookings
       WHERE status = 'active'
       AND start_time < ? AND end_time > ?`,
      [new Date(endTime.getTime() + bufferAfter).toISOString(), new Date(startTime.getTime() - bufferBefore).toISOString()]
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

    const id = uuidv4();
    await db.run(
      `INSERT INTO bookings (id, event_type_id, invitee_name, invitee_email, start_time, end_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [id, eventType.id, invitee_name, invitee_email, startTime.toISOString(), endTime.toISOString(), notes || '']
    );

    // Store custom question responses
    if (custom_answers && Array.isArray(custom_answers)) {
      for (const answer of custom_answers) {
        await db.run(
          `INSERT INTO booking_responses (id, booking_id, question, answer) VALUES (?, ?, ?, ?)`,
          [uuidv4(), id, answer.question, answer.answer]
        );
      }
    }

    const booking = await db.get(
      `SELECT b.*, e.name as event_type_name, e.duration, e.color
       FROM bookings b JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = ?`,
      [id]
    );

    // Send email in background without blocking response
    sendBookingConfirmationEmail(booking).catch(err => {
      console.error('Background email send failed:', err.message);
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
