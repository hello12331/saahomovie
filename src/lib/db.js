const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

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
