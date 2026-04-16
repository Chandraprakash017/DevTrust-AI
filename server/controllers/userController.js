const db = require("../config/db");

// GET USER PROFILE
exports.getProfile = (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT id, name, email, role, phone_number, bio, profile_picture, skills, reputation_score, created_at FROM users WHERE id = ?";
  
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) {
      console.warn(`🕵️ Profile fetch failed: User ID ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(result[0]);
  });
};

// UPDATE USER PROFILE
exports.updateProfile = (req, res) => {
  const userId = req.params.id;
  const { name, phone_number, bio, profile_picture, skills } = req.body;

  const sql = `
    UPDATE users 
    SET name = ?, phone_number = ?, bio = ?, profile_picture = ?, skills = ?
    WHERE id = ?
  `;

  db.query(sql, [name, phone_number, bio, profile_picture, skills, userId], (err) => {
    if (err) {
      console.error("❌ Profile Update Error:", err);
      return res.status(500).json({ message: "Update failed", error: err.message });
    }
    
    // Fetch updated user to return
    db.query("SELECT id, name, email, role, phone_number, bio, profile_picture, skills FROM users WHERE id = ?", [userId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "✅ Profile Updated Successfully", user: result[0] });
    });
  });
};
