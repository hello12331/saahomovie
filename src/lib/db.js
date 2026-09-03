const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'dev.db');

if (!fs.existsSync(dbPath)) {
  try {
    require('../../prisma/autoInitDb.js');
  } catch (err) {
    console.error("[AutoInit DB Error]", err);
  }
}

// Auto-migration check for missing columns on startup
function ensureSchemaColumns() {
  try {
    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      db.run(`ALTER TABLE Booking ADD COLUMN paymentMethod TEXT DEFAULT 'UPI'`, () => {});
      db.run(`ALTER TABLE Booking ADD COLUMN isPaid INTEGER DEFAULT 1`, () => {});
    });
    db.close();
  } catch (e) {
    // Columns already exist
  }
}

ensureSchemaColumns();

function getDb() {
  return new sqlite3.Database(dbPath);
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function execute(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    // Safety check: if params is undefined or null, default to [] to prevent SQLITE_RANGE column index errors
    const safeParams = Array.isArray(params) ? params : (params !== undefined && params !== null ? [params] : []);
    db.run(sql, safeParams, function (err) {
      db.close();
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { query, queryOne, execute };
