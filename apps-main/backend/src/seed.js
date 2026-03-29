const db = require('./database');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const existingTypes = await db.get('SELECT COUNT(*) as count FROM event_types');
  if (existingTypes && existingTypes.count > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding database...');

  const eventTypes = [
    { id: uuidv4(), name: '30 Minute Meeting', duration: 30, slug: '30min', description: 'A quick 30-minute meeting to connect and discuss.', color: '#0069ff' },
    { id: uuidv4(), name: '60 Minute Meeting', duration: 60, slug: '60min', description: 'A full hour meeting for in-depth discussions.', color: '#00a2ff' },
    { id: uuidv4(), name: '15 Minute Quick Chat', duration: 15, slug: '15min', description: 'A short 15-minute chat for quick questions.', color: '#7c3aed' },
  ];

  for (const et of eventTypes) {
    await db.run(
      'INSERT INTO event_types (id, name, duration, slug, description, color) VALUES (?, ?, ?, ?, ?, ?)',
      [et.id, et.name, et.duration, et.slug, et.description, et.color]
    );
  }
  console.log('Event types seeded.');

  for (let day = 0; day <= 6; day++) {
    const isWeekday = day >= 1 && day <= 5;
    await db.run(
      'INSERT INTO availability (id, day_of_week, start_time, end_time, is_active, timezone) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), day, '09:00', '17:00', isWeekday ? 1 : 0, 'UTC']
    );
  }
  console.log('Availability seeded.');

  const now = new Date();

  function futureDate(daysFromNow, hour) {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  function pastDate(daysAgo, hour) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() - 1);
    }
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  const thirtyMinId = eventTypes[0].id;
  const sixtyMinId = eventTypes[1].id;
  const fifteenMinId = eventTypes[2].id;

  const upcomingBookings = [
    { id: uuidv4(), event_type_id: thirtyMinId, invitee_name: 'Alice Johnson', invitee_email: 'alice@example.com', start: futureDate(2, 10), duration: 30, notes: 'Looking forward to connecting!' },
    { id: uuidv4(), event_type_id: sixtyMinId, invitee_name: 'Bob Smith', invitee_email: 'bob@example.com', start: futureDate(4, 14), duration: 60, notes: 'Want to discuss the project proposal.' },
    { id: uuidv4(), event_type_id: fifteenMinId, invitee_name: 'Carol White', invitee_email: 'carol@example.com', start: futureDate(6, 11), duration: 15, notes: '' },
  ];

  const pastBookings = [
    { id: uuidv4(), event_type_id: thirtyMinId, invitee_name: 'David Brown', invitee_email: 'david@example.com', start: pastDate(5, 10), duration: 30, notes: 'Follow-up on last quarter results.' },
    { id: uuidv4(), event_type_id: sixtyMinId, invitee_name: 'Eva Martinez', invitee_email: 'eva@example.com', start: pastDate(10, 15), duration: 60, notes: 'Strategy session.' },
  ];

  for (const b of [...upcomingBookings, ...pastBookings]) {
    const end = new Date(b.start.getTime() + b.duration * 60000);
    await db.run(
      `INSERT INTO bookings (id, event_type_id, invitee_name, invitee_email, start_time, end_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [b.id, b.event_type_id, b.invitee_name, b.invitee_email, b.start.toISOString(), end.toISOString(), b.notes || '']
    );
  }
  console.log('Bookings seeded.');
  console.log('Seeding complete!');
}

module.exports = { seed };