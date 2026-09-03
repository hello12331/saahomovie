const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

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
  },
  {
    id: "m4",
    title: "Avatar 3: Fire and Ash",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80",
    description: "Jake Sully and Neytiri encounter the Ash People, a fiery and aggressive Na'vi clan on Pandora.",
    genre: "Sci-Fi, Fantasy, Adventure",
    language: "English, Hindi, Telugu",
    durationMins: 190,
    certification: "U/A",
    releaseDate: "2025-12-19T00:00:00.000Z",
    cast: JSON.stringify(["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"]),
    crew: JSON.stringify([{ role: "Director", name: "James Cameron" }]),
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.7,
    ratingCount: 15400,
    isPublished: 1,
    isTrending: 0,
    isUpcoming: 1
  },
  {
    id: "m5",
    title: "Game Changer",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
    description: "An honest IAS officer takes on corrupt political figures to revolutionize electoral politics.",
    genre: "Action, Political, Drama",
    language: "Telugu, Hindi, Tamil",
    durationMins: 165,
    certification: "U/A",
    releaseDate: "2025-01-10T00:00:00.000Z",
    cast: JSON.stringify(["Ram Charan", "Kiara Advani", "SJ Suryah"]),
    crew: JSON.stringify([{ role: "Director", name: "S. Shankar" }]),
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.5,
    ratingCount: 7800,
    isPublished: 1,
    isTrending: 1,
    isUpcoming: 0
  }
];

const cinemas = [
  { id: "c1", name: "AMB Cinemas: Gachibowli", city: "Hyderabad", address: "Malla Reddy Towers, Gachibowli", facilities: JSON.stringify(["Dolby Atmos", "Recliners", "Food Court", "Parking", "IMAX"]) },
  { id: "c2", name: "PVR Prasads IMAX: Necklace Road", city: "Hyderabad", address: "LIC Building Road, Necklace Road", facilities: JSON.stringify(["IMAX 3D", "Dolby Atmos", "Gaming Zone", "Valet Parking"]) },
  { id: "c3", name: "Inox GVK One: Banjara Hills", city: "Hyderabad", address: "GVK One Mall, Rd 1 Banjara Hills", facilities: JSON.stringify(["Insignia VIP", "Dolby 7.1", "Gourmet Food"]) },
  { id: "c4", name: "PVR Trendset Mall", city: "Vijayawada", address: "MG Road, Vijayawada", facilities: JSON.stringify(["Dolby Atmos", "Food Court", "Parking"]) },
  { id: "c5", name: "Inox Varun Beach", city: "Visakhapatnam", address: "Beach Road, Visakhapatnam", facilities: JSON.stringify(["Ocean View Lounge", "4DX", "Dolby Atmos"]) },
  { id: "c6", name: "PVR Forum Mall: Koramangala", city: "Bengaluru", address: "Hosur Road, Koramangala", facilities: JSON.stringify(["IMAX 3D", "4DX", "Gold Class"]) },
  { id: "c7", name: "PVR ICON: Phoenix Palladium", city: "Mumbai", address: "Lower Parel, Mumbai", facilities: JSON.stringify(["IMAX Laser", "LUXE Lounge", "Dolby Atmos"]) }
];

const foodItems = [
  { id: "f1", name: "Caramel Popcorn (Large)", category: "Popcorn", image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80", description: "Freshly popped jumbo corn tossed in rich caramelized butter.", price: 290 },
  { id: "f2", name: "Salted Butter Popcorn (Regular)", category: "Popcorn", image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=500&q=80", description: "Classic hot salted butter popcorn.", price: 220 },
  { id: "f3", name: "Saaho Movie Counter Ultimate Combo", category: "Combos", image: "https://images.unsplash.com/photo-1572177812156-58036aae439c?w=500&q=80", description: "1 Large Popcorn + 2 Cold Drinks + 1 Nachos with Cheese.", price: 590 },
  { id: "f4", name: "Cheesy Jalapeno Nachos", category: "Snacks", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80", description: "Crispy corn tortilla chips with warm liquid cheese dip.", price: 260 },
  { id: "f5", name: "Ice Cold Cola (750ml)", category: "Drinks", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80", description: "Refreshing chilled fountain cola.", price: 180 }
];

const coupons = [
  { id: "cp1", code: "CINE20", description: "Get 20% OFF on all movie tickets up to ₹150", discountType: "PERCENTAGE", discountVal: 20, minAmount: 300, maxDiscount: 150, validUntil: "2026-12-31" },
  { id: "cp2", code: "EVENT50", description: "Flat ₹500 OFF on concert & event tickets", discountType: "FLAT", discountVal: 500, minAmount: 1000, maxDiscount: 500, validUntil: "2026-12-31" },
  { id: "cp3", code: "FIRSTBOOK", description: "Flat ₹100 OFF on your first booking", discountType: "FLAT", discountVal: 100, minAmount: 200, maxDiscount: 100, validUntil: "2026-12-31" },
  { id: "cp4", code: "WEEKEND100", description: "Flat ₹100 OFF on weekend movie shows", discountType: "FLAT", discountVal: 100, minAmount: 400, maxDiscount: 100, validUntil: "2026-12-31" }
];

const events = [
  { id: "e1", title: "A.R. Rahman Live in Concert: Hearts in Harmony", category: "CONCERT", banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80", description: "Experience the maestro live in a breathtaking arena concert featuring timeless hits and symphonic visuals.", venue: "Gachibowli Outdoor Stadium", city: "Hyderabad", eventDate: "2026-10-15T18:30:00.000Z", startTime: "06:30 PM", durationMins: 180, organizer: "Noise Events", price: 1499, capacity: 5000, isFeatured: 1 },
  { id: "e2", title: "Stand-Up Comedy Night ft. Zakir Khan", category: "COMEDY", banner: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80", description: "Laugh till your stomach hurts with India's favorite Sakht Launda.", venue: "Shilpakaram Auditorium", city: "Hyderabad", eventDate: "2026-09-20T19:00:00.000Z", startTime: "07:00 PM", durationMins: 120, organizer: "Laugh Factory", price: 799, capacity: 1200, isFeatured: 1 },
  { id: "e3", title: "IPL 2026: Sunrisers Hyderabad vs Chennai Super Kings", category: "SPORTS", banner: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80", description: "High-octane T20 cricket clash live at Uppal Stadium.", venue: "Rajiv Gandhi International Cricket Stadium", city: "Hyderabad", eventDate: "2026-09-25T19:30:00.000Z", startTime: "07:30 PM", durationMins: 210, organizer: "BCCI", price: 1250, capacity: 35000, isFeatured: 1 }
];

db.serialize(() => {
  // Insert Users
  const userStmt = db.prepare(`INSERT OR REPLACE INTO User (id, name, email, passwordHash, phone, role, savedCity, cineCoinsBalance, seatPreference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  userStmt.run("u_admin", "Admin", "admin@saahomovie.com", "$2a$10$wEa7Q39p8.dI9e1uGz2uXe.5J3yB4u/J8kK5P6u7m8n9o0p1q2r3s", "9999999999", "ADMIN", "Hyderabad", 500, "CENTER");
  userStmt.run("u_demo", "Rahul Sharma", "user@saahomovie.com", "$2a$10$wEa7Q39p8.dI9e1uGz2uXe.5J3yB4u/J8kK5P6u7m8n9o0p1q2r3s", "9876543210", "USER", "Hyderabad", 120, "BACK");
  userStmt.finalize();

  // Insert Movies
  const movieStmt = db.prepare(`INSERT OR REPLACE INTO Movie (id, title, poster, backdrop, description, genre, language, durationMins, certification, releaseDate, cast, crew, trailerUrl, rating, ratingCount, isPublished, isTrending, isUpcoming) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  movies.forEach(m => {
    movieStmt.run(m.id, m.title, m.poster, m.backdrop, m.description, m.genre, m.language, m.durationMins, m.certification, m.releaseDate, m.cast, m.crew, m.trailerUrl, m.rating, m.ratingCount, m.isPublished, m.isTrending, m.isUpcoming);
  });
  movieStmt.finalize();

  // Insert Cinemas
  const cinemaStmt = db.prepare(`INSERT OR REPLACE INTO Cinema (id, name, city, address, facilities) VALUES (?, ?, ?, ?, ?)`);
  cinemas.forEach(c => {
    cinemaStmt.run(c.id, c.name, c.city, c.address, c.facilities);
  });
  cinemaStmt.finalize();

  // Insert Food
  const foodStmt = db.prepare(`INSERT OR REPLACE INTO FoodItem (id, name, category, image, description, price) VALUES (?, ?, ?, ?, ?, ?)`);
  foodItems.forEach(f => {
    foodStmt.run(f.id, f.name, f.category, f.image, f.description, f.price);
  });
  foodStmt.finalize();

  // Insert Coupons
  const couponStmt = db.prepare(`INSERT OR REPLACE INTO Coupon (id, code, description, discountType, discountVal, minAmount, maxDiscount, validUntil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  coupons.forEach(cp => {
    couponStmt.run(cp.id, cp.code, cp.description, cp.discountType, cp.discountVal, cp.minAmount, cp.maxDiscount, cp.validUntil);
  });
  couponStmt.finalize();

  // Insert Events
  const eventStmt = db.prepare(`INSERT OR REPLACE INTO Event (id, title, category, banner, description, venue, city, eventDate, startTime, durationMins, organizer, price, capacity, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  events.forEach(e => {
    eventStmt.run(e.id, e.title, e.category, e.banner, e.description, e.venue, e.city, e.eventDate, e.startTime, e.durationMins, e.organizer, e.price, e.capacity, e.isFeatured);
  });
  eventStmt.finalize();

  // Create Screens & Seats for Cinema c1
  db.run(`INSERT OR REPLACE INTO Screen (id, cinemaId, name, screenType, totalRows, seatsPerRow) VALUES ('s1', 'c1', 'Screen 1 (IMAX)', 'IMAX 3D', 8, 12)`);
  db.run(`INSERT OR REPLACE INTO Screen (id, cinemaId, name, screenType, totalRows, seatsPerRow) VALUES ('s2', 'c1', 'Screen 2 (Dolby Atmos)', '2D', 8, 12)`);
  db.run(`INSERT OR REPLACE INTO Screen (id, cinemaId, name, screenType, totalRows, seatsPerRow) VALUES ('s3', 'c2', 'Audi 1', 'IMAX 3D', 8, 12)`);

  // Insert Seats for Screen s1
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
      seatStmt.run(`seat_s3_${row}_${num}`, "s3", row, num, cat);
    }
  });
  seatStmt.finalize();

  // Create Shows
  const todayStr = new Date().toISOString().split('T')[0];
  const showStmt = db.prepare(`INSERT OR REPLACE INTO Show (id, movieId, cinemaId, screenId, startTime, endTime, format, language, vipPrice, premiumPrice, execPrice, regularPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  showStmt.run("show_1", "m1", "c1", "s1", `${todayStr}T14:30:00.000Z`, `${todayStr}T17:30:00.000Z`, "IMAX 3D", "Telugu", 450, 350, 250, 180);
  showStmt.run("show_2", "m1", "c1", "s1", `${todayStr}T18:30:00.000Z`, `${todayStr}T21:30:00.000Z`, "IMAX 3D", "Telugu", 450, 350, 250, 180);
  showStmt.run("show_3", "m2", "c1", "s2", `${todayStr}T15:00:00.000Z`, `${todayStr}T18:00:00.000Z`, "2D", "Telugu", 400, 300, 220, 150);
  showStmt.run("show_4", "m3", "c2", "s3", `${todayStr}T19:00:00.000Z`, `${todayStr}T22:00:00.000Z`, "IMAX 3D", "Telugu", 500, 400, 300, 200);

  showStmt.finalize();

  console.log("Movie posters updated successfully!");
});

db.close();
