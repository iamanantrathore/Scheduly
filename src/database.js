const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'calendly.db');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
    throw err;
  }
});

db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');
  db.run(`
    CREATE TABLE IF NOT EXISTS event_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#0069ff',
      buffer_before INTEGER DEFAULT 0,
      buffer_after INTEGER DEFAULT 0,
      custom_questions TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS availability (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      timezone TEXT DEFAULT 'UTC',
      buffer_time_before INTEGER DEFAULT 0,
      buffer_time_after INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      event_type_id TEXT NOT NULL,
      invitee_name TEXT NOT NULL,
      invitee_email TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS date_specific_availability (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS booking_responses (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

  // Email templates table temporarily disabled
  /*
  db.run(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id TEXT PRIMARY KEY,
      type TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  */

  // Insert default email templates if they don't exist
  // Temporarily disabled
  /*
  db.run(`INSERT OR IGNORE INTO email_templates (id, type, subject, body) VALUES (?, ?, ?, ?)`, [
    'booking_confirmation',
    'booking_confirmation',
    'Booking Confirmed: {event_name}',
    'Hi {invitee_name},\n\nYour booking for "{event_name}" has been confirmed!\n\n📅 Date: {date}\n🕐 Time: {time}\n📍 Location: {location}\n\nWe\'ll send you a reminder 24 hours before the meeting.\n\nBest regards,\nScheduly Team'
  ]);
  db.run(`INSERT OR IGNORE INTO email_templates (id, type, subject, body) VALUES (?, ?, ?, ?)`, [
    'booking_cancellation',
    'booking_cancellation',
    'Booking Cancelled: {event_name}',
    'Hi {invitee_name},\n\nYour booking for "{event_name}" on {date} at {time} has been cancelled.\n\nIf you need to reschedule, please book a new time.\n\nBest regards,\nScheduly Team'
  ]);
  db.run(`INSERT OR IGNORE INTO email_templates (id, type, subject, body) VALUES (?, ?, ?, ?)`, [
    'meeting_reminder',
    'meeting_reminder',
    'Reminder: {event_name} tomorrow',
    'Hi {invitee_name},\n\nThis is a reminder for your upcoming meeting "{event_name}".\n\n📅 Date: {date}\n🕐 Time: {time}\n📍 Location: {location}\n\nSee you then!\n\nBest regards,\nScheduly Team'
  ]);
  */
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all,
  exec,
  close,
};
