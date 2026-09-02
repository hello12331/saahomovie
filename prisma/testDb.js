const fs = require('fs');
const path = require('path');

// Ensure db directory exists
const dbPath = path.join(__dirname, 'dev.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// In Next.js App Router we can create a lightweight JSON file database or pure JS DB driver if native modules fail to build
console.log("Initializing pure JS data store...");
