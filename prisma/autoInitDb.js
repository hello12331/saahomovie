const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const prismaDir = path.join(__dirname);
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

const dbPath = path.join(prismaDir, 'dev.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS User (
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

  db.run(`CREATE TABLE IF NOT EXISTS Movie (
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

  db.run(`CREATE TABLE IF NOT EXISTS Cinema (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    facilities TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Screen (
    id TEXT PRIMARY KEY,
    cinemaId TEXT NOT NULL,
    name TEXT NOT NULL,
    screenType TEXT NOT NULL,
    totalRows INTEGER NOT NULL,
    seatsPerRow INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cinemaId) REFERENCES Cinema(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Seat (
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

  db.run(`CREATE TABLE IF NOT EXISTS Show (
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

  db.run(`CREATE TABLE IF NOT EXISTS SeatLock (
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

  db.run(`CREATE TABLE IF NOT EXISTS Event (
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

  db.run(`CREATE TABLE IF NOT EXISTS FoodItem (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    isAvailable INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Booking (
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

  db.run(`CREATE TABLE IF NOT EXISTS BookingSeat (
    id TEXT PRIMARY KEY,
    bookingId TEXT NOT NULL,
    seatId TEXT NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
    FOREIGN KEY (seatId) REFERENCES Seat(id) ON DELETE CASCADE,
    UNIQUE(bookingId, seatId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS FoodOrderItem (
    id TEXT PRIMARY KEY,
    bookingId TEXT NOT NULL,
    foodItemId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
    FOREIGN KEY (foodItemId) REFERENCES FoodItem(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Payment (
    id TEXT PRIMARY KEY,
    bookingId TEXT UNIQUE NOT NULL,
    paymentMethod TEXT NOT NULL,
    transactionId TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'SUCCESS',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Coupon (
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

  db.run(`CREATE TABLE IF NOT EXISTS Review (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    movieId TEXT,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Wishlist (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    movieId TEXT,
    eventId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
    FOREIGN KEY (eventId) REFERENCES Event(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Notification (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  )`);

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
});

// Run Seed data initialization
const movies = [
  {
    id: "m1",
    title: "Kalki 2898 AD",
    poster: "https://m.media-amazon.com/images/M/MV5BMGRjZTQ0YzUtYWJjMS00OGY1LTkwNjMtYjYwZmFmNTY3MGZkXkEyXkFqcGc@._V1_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BMGRjZTQ0YzUtYWJjMS00OGY1LTkwNjMtYjYwZmFmNTY3MGZkXkEyXkFqcGc@._V1_.jpg",
    description: "A modern avatar of Vishnu descends to Earth to protect humanity from dark forces in a dystopian post-apocalyptic world.",
    genre: "Sci-Fi, Action, Drama",
    language: "Telugu, Hindi, Tamil",
    durationMins: 180,
    certification: "U/A",
    releaseDate: "2024-06-27T00:00:00.000Z",
    cast: JSON.stringify(["Prabhas", "Amitabh Bachchan", "Kamal Haasan", "Deepika Padukone"]),
    crew: JSON.stringify([{ role: "Director", name: "Nag Ashwin" }]),
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.8,
    ratingCount: 14500,
    isPublished: 1,
    isTrending: 1,
    isUpcoming: 0
  },
  {
    id: "m2",
    title: "Devara: Part 1",
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXMHlqPQaoVX0l-aK2tHtstkHE53pJsfxhq-K51tSDpw&s=10",
    backdrop: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXMHlqPQaoVX0l-aK2tHtstkHE53pJsfxhq-K51tSDpw&s=10",
    description: "An epic action saga set against coastal lands, chronicling fearlessness, vengeance and power.",
    genre: "Action, Thriller, Drama",
    language: "Telugu, Hindi",
    durationMins: 172,
    certification: "U/A",
    releaseDate: "2024-09-27T00:00:00.000Z",
    cast: JSON.stringify(["NTR Jr.", "Janhvi Kapoor", "Saif Ali Khan"]),
    crew: JSON.stringify([{ role: "Director", name: "Koratala Siva" }]),
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.6,
    ratingCount: 9800,
    isPublished: 1,
    isTrending: 1,
    isUpcoming: 0
  },
  {
    id: "m3",
    title: "Pushpa 2: The Rule",
    poster: "https://i.pinimg.com/736x/96/d9/dd/96d9ddf3c81ff8b76eaa4f064b55377b.jpg",
    backdrop: "https://i.pinimg.com/736x/96/d9/dd/96d9ddf3c81ff8b76eaa4f064b55377b.jpg",
    description: "The clash between Pushpa Raj and Bhanwar Singh Shekhawat intensifies as Pushpa expands his red sandalwood empire.",
    genre: "Action, Crime, Thriller",
    language: "Telugu, Hindi, Tamil, Malayalam",
    durationMins: 195,
    certification: "U/A",
    releaseDate: "2024-12-05T00:00:00.000Z",
    cast: JSON.stringify(["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"]),
    crew: JSON.stringify([{ role: "Director", name: "Sukumar" }]),
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.9,
    ratingCount: 22000,
    isPublished: 1,
    isTrending: 1,
    isUpcoming: 0
  }
];

const cinemas = [
  { id: "c1", name: "AMB Cinemas: Gachibowli", city: "Hyderabad", address: "Malla Reddy Towers, Gachibowli", facilities: JSON.stringify(["Dolby Atmos", "Recliners", "Food Court", "Parking", "IMAX"]) },
  { id: "c2", name: "PVR Prasads IMAX: Necklace Road", city: "Hyderabad", address: "LIC Building Road, Necklace Road", facilities: JSON.stringify(["IMAX 3D", "Dolby Atmos", "Gaming Zone", "Valet Parking"]) },
  { id: "c4", name: "PVR Trendset Mall", city: "Vijayawada", address: "MG Road, Vijayawada", facilities: JSON.stringify(["Dolby Atmos", "Food Court", "Parking"]) }
];

const foodItems = [
  { id: "f1", name: "Caramel Popcorn (Large)", category: "Popcorn", image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80", description: "Freshly popped jumbo corn tossed in rich caramelized butter.", price: 290 },
  { id: "f2", name: "Salted Butter Popcorn (Regular)", category: "Popcorn", image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=500&q=80", description: "Classic hot salted butter popcorn.", price: 220 },
  { id: "f3", name: "Saaho Movie Counter Ultimate Combo", category: "Combos", image: "https://images.unsplash.com/photo-1572177812156-58036aae439c?w=500&q=80", description: "1 Large Popcorn + 2 Cold Drinks + 1 Nachos with Cheese.", price: 590 }
];

const coupons = [
  { id: "cp1", code: "CINE20", description: "Get 20% OFF on all movie tickets up to ₹150", discountType: "PERCENTAGE", discountVal: 20, minAmount: 300, maxDiscount: 150, validUntil: "2026-12-31" },
  { id: "cp2", code: "EVENT50", description: "Flat ₹500 OFF on concert & event tickets", discountType: "FLAT", discountVal: 500, minAmount: 1000, maxDiscount: 500, validUntil: "2026-12-31" },
  { id: "cp3", code: "FIRSTBOOK", description: "Flat ₹100 OFF on your first booking", discountType: "FLAT", discountVal: 100, minAmount: 200, maxDiscount: 100, validUntil: "2026-12-31" }
];

const events = [
  { id: "e1", title: "A.R. Rahman Live in Concert: Hearts in Harmony", category: "CONCERT", banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80", description: "Experience the maestro live in a breathtaking arena concert featuring timeless hits and symphonic visuals.", venue: "Gachibowli Outdoor Stadium", city: "Hyderabad", eventDate: "2026-10-15T18:30:00.000Z", startTime: "06:30 PM", durationMins: 180, organizer: "Noise Events", price: 1499, capacity: 5000, isFeatured: 1 },
  { id: "e2", title: "Stand-Up Comedy Night ft. Zakir Khan", category: "COMEDY", banner: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80", description: "Laugh till your stomach hurts with India's favorite Sakht Launda.", venue: "Shilpakaram Auditorium", city: "Hyderabad", eventDate: "2026-09-20T19:00:00.000Z", startTime: "07:00 PM", durationMins: 120, organizer: "Laugh Factory", price: 799, capacity: 1200, isFeatured: 1 }
];

db.serialize(() => {
  const userStmt = db.prepare(`INSERT OR REPLACE INTO User (id, name, email, passwordHash, phone, role, savedCity, cineCoinsBalance, seatPreference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  userStmt.run("u_admin", "Admin", "admin@saahomovie.com", "$2a$10$wEa7Q39p8.dI9e1uGz2uXe.5J3yB4u/J8kK5P6u7m8n9o0p1q2r3s", "9999999999", "ADMIN", "Hyderabad", 500, "CENTER");
  userStmt.run("u_demo", "Rahul Sharma", "user@saahomovie.com", "$2a$10$wEa7Q39p8.dI9e1uGz2uXe.5J3yB4u/J8kK5P6u7m8n9o0p1q2r3s", "9876543210", "USER", "Hyderabad", 120, "BACK");
  userStmt.finalize();

  const movieStmt = db.prepare(`INSERT OR REPLACE INTO Movie (id, title, poster, backdrop, description, genre, language, durationMins, certification, releaseDate, cast, crew, trailerUrl, rating, ratingCount, isPublished, isTrending, isUpcoming) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  movies.forEach(m => {
    movieStmt.run(m.id, m.title, m.poster, m.backdrop, m.description, m.genre, m.language, m.durationMins, m.certification, m.releaseDate, m.cast, m.crew, m.trailerUrl, m.rating, m.ratingCount, m.isPublished, m.isTrending, m.isUpcoming);
  });
  movieStmt.finalize();

  const cinemaStmt = db.prepare(`INSERT OR REPLACE INTO Cinema (id, name, city, address, facilities) VALUES (?, ?, ?, ?, ?)`);
  cinemas.forEach(c => {
    cinemaStmt.run(c.id, c.name, c.city, c.address, c.facilities);
  });
  cinemaStmt.finalize();

  const foodStmt = db.prepare(`INSERT OR REPLACE INTO FoodItem (id, name, category, image, description, price) VALUES (?, ?, ?, ?, ?, ?)`);
  foodItems.forEach(f => {
    foodStmt.run(f.id, f.name, f.category, f.image, f.description, f.price);
  });
  foodStmt.finalize();

  const couponStmt = db.prepare(`INSERT OR REPLACE INTO Coupon (id, code, description, discountType, discountVal, minAmount, maxDiscount, validUntil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  coupons.forEach(cp => {
    couponStmt.run(cp.id, cp.code, cp.description, cp.discountType, cp.discountVal, cp.minAmount, cp.maxDiscount, cp.validUntil);
  });
  couponStmt.finalize();

  const eventStmt = db.prepare(`INSERT OR REPLACE INTO Event (id, title, category, banner, description, venue, city, eventDate, startTime, durationMins, organizer, price, capacity, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  events.forEach(e => {
    eventStmt.run(e.id, e.title, e.category, e.banner, e.description, e.venue, e.city, e.eventDate, e.startTime, e.durationMins, e.organizer, e.price, e.capacity, e.isFeatured);
  });
  eventStmt.finalize();

  db.run(`INSERT OR REPLACE INTO Screen (id, cinemaId, name, screenType, totalRows, seatsPerRow) VALUES ('s1', 'c1', 'Screen 1 (IMAX)', 'IMAX 3D', 8, 12)`);
  db.run(`INSERT OR REPLACE INTO Screen (id, cinemaId, name, screenType, totalRows, seatsPerRow) VALUES ('s2', 'c1', 'Screen 2 (Dolby Atmos)', '2D', 8, 12)`);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatStmt = db.prepare(`INSERT OR REPLACE INTO Seat (id, screenId, rowLabel, seatNumber, category) VALUES (?, ?, ?, ?, ?)`);
  rows.forEach((row, rIdx) => {
    let cat = "REGULAR";
    if (rIdx >= 6) cat = "VIP";
    else if (rIdx >= 4) cat = "PREMIUM";
    else if (rIdx >= 2) cat = "EXECUTIVE";

    for (let num = 1; num <= 12; num++) {
      seatStmt.run(`seat_s1_${row}_${num}`, "s1", row, num, cat);
      seatStmt.run(`seat_s2_${row}_${num}`, "s2", row, num, cat);
    }
  });
  seatStmt.finalize();

  const todayStr = new Date().toISOString().split('T')[0];
  const showStmt = db.prepare(`INSERT OR REPLACE INTO Show (id, movieId, cinemaId, screenId, startTime, endTime, format, language, vipPrice, premiumPrice, execPrice, regularPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  showStmt.run("show_1", "m1", "c1", "s1", `${todayStr}T14:30:00.000Z`, `${todayStr}T17:30:00.000Z`, "IMAX 3D", "Telugu", 450, 350, 250, 180);
  showStmt.run("show_2", "m1", "c1", "s1", `${todayStr}T18:30:00.000Z`, `${todayStr}T21:30:00.000Z`, "IMAX 3D", "Telugu", 450, 350, 250, 180);
  showStmt.run("show_3", "m2", "c1", "s2", `${todayStr}T15:00:00.000Z`, `${todayStr}T18:00:00.000Z`, "2D", "Telugu", 400, 300, 220, 150);
  showStmt.run("show_4", "m3", "c1", "s1", `${todayStr}T20:00:00.000Z`, `${todayStr}T23:00:00.000Z`, "IMAX 3D", "Telugu", 500, 400, 300, 200);
  showStmt.finalize();

  console.log("Database initialized & seeded automatically for Cloud Deployment!");
});

db.close();
