const mysql = require("mysql2");

let activeDb;
let isMock = false;

// memory mein storage (mock mode ke liye)
const memoryStore = {
  users: [
    { id: 1, name: "Admin", email: "admin@gmail.com", password: "$2a$10$WqU2o881.h.A85y.K0wG6OpfW.qX9m61qM0Z6Hq.3o2q0V2c5v5F.", role: "admin", plan: "pro", skills: "[]", reputation_score: 5.0 },
    { id: 2, name: "Chandra", email: "chan@gmail.com", password: "$2a$10$WqU2o881.h.A85y.K0wG6OpfW.qX9m61qM0Z6Hq.3o2q0V2c5v5F.", role: "freelancer", plan: "free", skills: "[\"React\", \"Node.js\", \"UI Design\"]", reputation_score: 4.8 },
  ],
  subscriptions: [],
  tasks: [
    { id: 1, title: "Build AI Chatbot", description: "Design and implement a Gemini AI integrated chatbot.", reward: 5000, difficulty: "hard", tags: "AI, React" },
    { id: 2, title: "Modernize UI", description: "Convert existing dashboard to glassmorphic design.", reward: 2500, difficulty: "medium", tags: "UI/UX, CSS" },
    { id: 3, title: "Bug Cleanup", description: "Fix 5 minor console warnings in production.", reward: 1200, difficulty: "easy", tags: "Debugging" },
  ],
  earnings: [
    { id: 1, user_id: 2, amount: 1500, source: "UI/UX Upgrade", created_at: new Date() },
    { id: 2, user_id: 2, amount: 2000, source: "Backend Fix", created_at: new Date() },
  ],
  messages: [],
  trainings: [],
  verification: [],
  invoices: [],
  notifications: [
    { id: 1, user_id: 2, message: "🌟 Welcome to DevTrust! Explore jobs and verify your profile.", created_at: new Date() }
  ],
};

// asli mysql start karo
const pool = mysql.createConnection({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "devtrust",
});

pool.connect((err) => {
  if (err) {
    console.log("⚠️  MySQL Not Found (is port 3306 open?): Switching to SMART MOCK MODE 🚀");
    isMock = true;
    
    // nakli db object banao
    activeDb = {
      query: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        const cleaned = sql.toLowerCase().trim();
        
        // nakli auth (email check)
        if (cleaned.includes("from users where email")) {
          const emailToFind = params[0].toLowerCase();
          const u = memoryStore.users.find(x => x.email.toLowerCase() === emailToFind);
          return callback(null, u ? [u] : []);
        }
        
        // nakli profile (id check)
        if (cleaned.includes("from users where id")) {
          const idToFind = params[0];
          const u = memoryStore.users.find(x => x.id == idToFind);
          return callback(null, u ? [u] : []);
        }

        // nakli registration
        if (cleaned.startsWith("insert into users")) {
          const [name, email, password, role] = params;
          const normalizedEmail = email.toLowerCase();
          const newUser = { 
            id: Date.now(), 
            name, 
            email: normalizedEmail, 
            password, 
            role, 
            reputation_score: 5.0, 
            preferred_language: 'en',
            phone_number: '',
            skills: '[]',
            plan: 'free'
          };
          memoryStore.users.push(newUser);
          return callback(null, { insertId: newUser.id });
        }

        // nakli users list
        if (cleaned.startsWith("select") && cleaned.includes("from users")) {
           return callback(null, memoryStore.users);
        }

        // nakli task logic
        if (cleaned.includes("from tasks")) {
          return callback(null, memoryStore.tasks);
        }

        // nakli earnings
        if (cleaned.includes("from earnings")) {
          const userId = params[0];
          const userEarnings = userId 
            ? memoryStore.earnings.filter(e => e.user_id == userId) 
            : memoryStore.earnings;
          return callback(null, userEarnings);
        }

        // nakli notifications (select)
        if (cleaned.includes("from notifications")) {
          const userId = params[0];
          const userNotis = userId 
            ? memoryStore.notifications.filter(n => n.user_id == userId) 
            : memoryStore.notifications;
          return callback(null, userNotis);
        }

        // nakli notifications (insert)
        if (cleaned.startsWith("insert into notifications")) {
          const [userId, message] = params;
          const newNoti = {
            id: Date.now(),
            user_id: userId,
            message,
            created_at: new Date()
          };
          memoryStore.notifications.push(newNoti);
          return callback(null, { insertId: newNoti.id });
        }

        // nakli trainings (select)
        if (cleaned.includes("from trainings")) {
          return callback(null, memoryStore.trainings);
        }

        // nakli trainings (insert)
        if (cleaned.startsWith("insert into trainings")) {
          const [title, description, level] = params;
          const newTraining = {
            id: Date.now(),
            title,
            description,
            level,
            created_at: new Date()
          };
          memoryStore.trainings.push(newTraining);
          return callback(null, { insertId: newTraining.id });
        }

        // nakli trainings (delete)
        if (cleaned.startsWith("delete from trainings")) {
          const idToDelete = params[0];
          memoryStore.trainings = memoryStore.trainings.filter(t => t.id != idToDelete);
          return callback(null, { affectedRows: 1 });
        }

        // nakli tasks (insert)
        if (cleaned.startsWith("insert into tasks")) {
          const [title, description, reward, difficulty, required_skills, tags] = params;
          const newTask = {
            id: Date.now(),
            title,
            description,
            reward: parseFloat(reward || 0),
            difficulty,
            required_skills,
            tags,
            status: 'open',
            created_at: new Date()
          };
          memoryStore.tasks.push(newTask);
          return callback(null, { insertId: newTask.id });
        }

        // aam success
        callback(null, { insertId: Date.now() });
      }
    };
  } else {
    console.log("✅ MySQL Server Connected (Production Mode)");
    isMock = false;
    activeDb = pool;
    initializeTables(activeDb);
  }
});

function initializeTables(db) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'freelancer', 'client') DEFAULT 'freelancer',
      skills TEXT,
      resume_url TEXT,
      bio TEXT,
      profile_picture TEXT,
      phone_number VARCHAR(20),
      reputation_score DECIMAL(3,2) DEFAULT 0,
      preferred_language VARCHAR(10) DEFAULT 'en',
      plan ENUM('free', 'pro') DEFAULT 'free',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // normal mysql me, hum alter table if not exists nahi use karte.
    // bas run kar dete hai; agar column hai, toh aaram se fail hoga ya hum catch karenge.
    `ALTER TABLE users ADD COLUMN reputation_score DECIMAL(3,2) DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN phone_number VARCHAR(20)`,
    `ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'`,
    `ALTER TABLE users ADD COLUMN plan ENUM('free', 'pro') DEFAULT 'free'`,
    
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      plan ENUM('free', 'pro') DEFAULT 'free',
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP,
      transaction_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      reward DECIMAL(10,2) DEFAULT 0,
      difficulty ENUM('easy','medium','hard') DEFAULT 'easy',
      required_skills TEXT,
      tags TEXT,
      status ENUM('open', 'in_progress', 'completed', 'disputed') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS trainings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT NOT NULL,
      file_url TEXT,
      file_name TEXT,
      file_type VARCHAR(50),
      seen TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS earnings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10,2) DEFAULT 0,
      source VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS verification (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      document_url TEXT NOT NULL,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      reviewer_id INT NOT NULL,
      reviewee_id INT NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      is_verified TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS escrow_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      client_id INT NOT NULL,
      freelancer_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('held', 'released', 'disputed', 'refunded') DEFAULT 'held',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS disputes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      raised_by INT NOT NULL,
      reason TEXT NOT NULL,
      status ENUM('open', 'resolved', 'closed') DEFAULT 'open',
      resolution_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS fraud_alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      severity ENUM('low', 'medium', 'high') DEFAULT 'low',
      description TEXT,
      status ENUM('pending', 'active', 'dismissed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS interviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_1 INT NOT NULL,
      user_2 INT NOT NULL,
      status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
      scheduled_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  tables.forEach((sql) => {
    db.query(sql, (err) => {
      // pehle se bane column/table ke error ignore karo
    });
  });
}

// race condition rokne ke liye wrapper export karo
module.exports = {
  query: (sql, params, callback) => {
    if (activeDb) {
      return activeDb.query(sql, params, callback);
    }
    // agar start nahi hua to fallback
    return pool.query(sql, params, callback);
  }
};