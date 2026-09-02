const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'dev.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE User (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'USER',
    avatar TEXT,
    savedCity TEXT DEFAULT 'Hyderabad',
    cineCoinsBalance INTEGER DEFAULT 0,
    seatPreference TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE Movie (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    poster TEXT NOT NULL,
    backdrop TEXT NOT NULL,
    description TEXT NOT NULL,
    genre TEXT NOT NULL,
    language TEXT NOT NULL,
    durationMins INTEGER NOT NULL,
    certification TEXT NOT NULL,
    releaseDate DATETIME NOT NULL,
    cast TEXT NOT NULL,
    crew TEXT NOT NULL,
    trailerUrl TEXT NOT NULL,
    rating REAL DEFAULT 0.0,
    ratingCount INTEGER DEFAULT 0,
    isPublished INTEGER DEFAULT 1,
    isTrending INTEGER DEFAULT 0,
    isUpcoming INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE Cinema (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    facilities TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE Screen (
    id TEXT PRIMARY KEY,
    cinemaId TEXT NOT NULL,
    name TEXT NOT NULL,
    screenType TEXT NOT NULL,
    totalRows INTEGER NOT NULL,
    seatsPerRow INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cinemaId) REFERENCES Cinema(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE Seat (
    id TEXT PRIMARY KEY,
    screenId TEXT NOT NULL,
    rowLabel TEXT NOT NULL,
    seatNumber INTEGER NOT NULL,
    category TEXT DEFAULT 'REGULAR',
    isAccessible INTEGER DEFAULT 0,
    isBlocked INTEGER DEFAULT 0,
    FOREIGN KEY (screenId) REFERENCES Screen(id) ON DELETE CASCADE,
    UNIQUE(screenId, rowLabel, seatNumber)
  )`);

  db.run(`CREATE TABLE Show (
    id TEXT PRIMARY KEY,
    movieId TEXT NOT NULL,
    cinemaId TEXT NOT NULL,
    screenId TEXT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    format TEXT NOT NULL,
    language TEXT NOT NULL,
    vipPrice REAL NOT NULL,
    premiumPrice REAL NOT NULL,
    execPrice REAL NOT NULL,
    regularPrice REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
    FOREIGN KEY (cinemaId) REFERENCES Cinema(id) ON DELETE CASCADE,
    FOREIGN KEY (screenId) REFERENCES Screen(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE SeatLock (
    id TEXT PRIMARY KEY,
    showId TEXT NOT NULL,
    seatId TEXT NOT NULL,
    userId TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (showId) REFERENCES Show(id) ON DELETE CASCADE,
    FOREIGN KEY (seatId) REFERENCES Seat(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE(showId, seatId)
  )`);

  db.run(`CREATE TABLE Event (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    banner TEXT NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    eventDate DATETIME NOT NULL,
    startTime TEXT NOT NULL,
    durationMins INTEGER NOT NULL,
    organizer TEXT NOT NULL,
    price REAL NOT NULL,
    capacity INTEGER NOT NULL,
    bookedCount INTEGER DEFAULT 0,
    isPublished INTEGER DEFAULT 1,
    isFeatured INTEGER DEFAULT 0,
    terms TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE FoodItem (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    isAvailable INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE Booking (
    id TEXT PRIMARY KEY,
    bookingCode TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    showId TEXT,
    eventId TEXT,
    ticketAmount REAL NOT NULL,
    foodAmount REAL DEFAULT 0,
    convenienceFee REAL DEFAULT 0,
    taxAmount REAL DEFAULT 0,
    discountAmount REAL DEFAULT 0,
    totalAmount REAL NOT NULL,
    cineCoinsEarned INTEGER DEFAULT 0,
    cineCoinsUsed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'CONFIRMED',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (showId) REFERENCES Show(id) ON DELETE SET NULL,
    FOREIGN KEY (eventId) REFERENCES Event(id) ON DELETE SET NULL
  )`);

  db.run(`CREATE TABLE BookingSeat (
    id TEXT PRIMARY KEY,
    bookingId TEXT NOT NULL,
    seatId TEXT NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
    FOREIGN KEY (seatId) REFERENCES Seat(id) ON DELETE CASCADE,
    UNIQUE(bookingId, seatId)
  )`);

  db.run(`CREATE TABLE FoodOrderItem (
    id TEXT PRIMARY KEY,
    bookingId TEXT NOT NULL,
    foodItemId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
    FOREIGN KEY (foodItemId) REFERENCES FoodItem(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE Payment (
    id TEXT PRIMARY KEY,
    bookingId TEXT UNIQUE NOT NULL,
    paymentMethod TEXT NOT NULL,
    transactionId TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'SUCCESS',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE Coupon (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discountType TEXT NOT NULL,
    discountVal REAL NOT NULL,
    minAmount REAL DEFAULT 0,
    maxDiscount REAL,
    validUntil DATETIME NOT NULL,
    isActive INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE Review (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    movieId TEXT,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE Wishlist (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    movieId TEXT,
    eventId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
    FOREIGN KEY (eventId) REFERENCES Event(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE Notification (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  )`);

  console.log("Database tables created successfully.");
});

db.close();
