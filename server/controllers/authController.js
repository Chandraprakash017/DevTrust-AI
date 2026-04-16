const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const normalizedEmail = email.toLowerCase();
  const checkUser = "SELECT * FROM users WHERE email = ?";
  db.query(checkUser, [normalizedEmail], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const validRole = ["freelancer", "client"].includes(role) ? role : "freelancer";

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, normalizedEmail, hashedPassword, validRole], (err) => {
      if (err) {
        console.error("❌ Registration Error:", err);
        return res.status(500).json({ message: "Registration failed", error: err.message });
      }
      console.log("✅ User Registered:", email);
      res.json({ message: "✅ Registered Successfully" });
    });
  });
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const normalizedEmail = email.toLowerCase();
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [normalizedEmail], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      console.warn(`🕵️ Login failed: User not found (${normalizedEmail})`);
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "devtrustsecret",
      { expiresIn: "1d" }
    );

    // Don't send password back
    const { password: _, ...safeUser } = user;

    res.json({
      message: "✅ Login Successful",
      token,
      user: safeUser,
    });
  });
};

// GET ALL USERS (for admin / chat user list)
exports.getUsers = (req, res) => {
  db.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// GET STATS (for admin dashboard)
exports.getStats = (req, res) => {
  const queries = {
    totalUsers: "SELECT COUNT(*) AS count FROM users",
    totalFreelancers: "SELECT COUNT(*) AS count FROM users WHERE role='freelancer'",
    totalClients: "SELECT COUNT(*) AS count FROM users WHERE role='client'",
    pendingVerifications: "SELECT COUNT(*) AS count FROM verification WHERE status='pending'",
    totalEarnings: "SELECT COALESCE(SUM(amount), 0) AS total FROM earnings",
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.query(queries[key], (err, result) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = result[0].count ?? result[0].total ?? 0;
      }
      completed++;
      if (completed === keys.length) {
        res.json(results);
      }
    });
  });
};

// CREATE ADMIN (one-time setup)
exports.createAdmin = (req, res) => {
  const hashed = bcrypt.hashSync("123456", 10);
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Admin", "admin@gmail.com", hashed, "admin"],
    (err) => {
      if (err) return res.json({ message: "Admin might already exist", error: err.message });
      res.send("✅ Admin created: admin@gmail.com / 123456");
    }
  );
};

// GOOGLE LOGIN
exports.googleLogin = (req, res) => {
  const { name, email, profile_picture } = req.body;

  if (!email) return res.status(400).json({ message: "Google account must have an email" });
  const normalizedEmail = email.toLowerCase();

  const checkUser = "SELECT * FROM users WHERE email = ?";
  db.query(checkUser, [normalizedEmail], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      // User exists, log them in
      const user = result[0];
      console.log(`✅ Google User Found: ${normalizedEmail}`);
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "devtrustsecret",
        { expiresIn: "1d" }
      );
      const { password: _, ...safeUser } = user;
      return res.json({ message: "✅ Google Login Successful", token, user: safeUser });
    } else {
      // User doesn't exist, create account
      const sql = "INSERT INTO users (name, email, password, role, profile_picture) VALUES (?, ?, ?, ?, ?)";
      const dummyPassword = bcrypt.hashSync(Math.random().toString(36), 10);
      
      db.query(sql, [name, normalizedEmail, dummyPassword, "freelancer", profile_picture], (err, result) => {
        if (err) {
          console.error("❌ Google Registration Error:", err);
          return res.status(500).json({ message: "Google register failed", error: err.message });
        }

        const newId = result.insertId;
        const newUser = { id: newId, name, email: normalizedEmail, role: "freelancer", profile_picture };
        const token = jwt.sign(
          { id: newUser.id, role: newUser.role },
          process.env.JWT_SECRET || "devtrustsecret",
          { expiresIn: "1d" }
        );

        res.json({ message: "✅ Google Account Created & Logged In", token, user: newUser });
      });
    }
  });
};