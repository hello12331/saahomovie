const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Automatically ensure DB tables exist on first request if DB was cleared in serverless / cloud container
const dbDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'dev.db');

// Run autoInit script if DB file doesn't exist
if (!fs.existsSync(dbPath)) {
  try {
    require('../../prisma/autoInitDb.js');
  } catch (err) {
    console.error("[AutoInit DB Error]", err);
  }
}

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
    db.run(sql, params, function (err) {
      db.close();
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { query, queryOne, execute };
