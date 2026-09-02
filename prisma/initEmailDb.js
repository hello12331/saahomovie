const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Table for Email Logs
  db.run(`CREATE TABLE IF NOT EXISTS EmailLog (
    id TEXT PRIMARY KEY,
    userId TEXT,
    bookingId TEXT,
    emailType TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'SENT',
    errorMessage TEXT,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table for OTP Store
  db.run(`CREATE TABLE IF NOT EXISTS OtpStore (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otpCode TEXT NOT NULL,
    purpose TEXT DEFAULT 'LOGIN',
    expiresAt DATETIME NOT NULL,
    attempts INTEGER DEFAULT 0,
    used INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log("Email & OTP database tables verified!");
});

db.close();
