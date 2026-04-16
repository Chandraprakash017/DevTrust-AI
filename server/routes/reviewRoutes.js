const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * ─── POST REVIEW ──────────────────────────────────────────
 * Add a review for a freelancer/client.
 */
router.post("/", (req, res) => {
  const { task_id, reviewer_id, reviewee_id, rating, comment, is_verified } = req.body;

  const sql = `INSERT INTO reviews (task_id, reviewer_id, reviewee_id, rating, comment, is_verified) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [task_id, reviewer_id, reviewee_id, rating, comment, is_verified], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Trigger Reputation Update
    updateReputationScore(reviewee_id);
    
    res.json({ message: "Review posted successfully!", reviewId: result.insertId });
  });
});

/**
 * ─── GET REVIEWS ──────────────────────────────────────────
 */
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT * FROM reviews WHERE reviewee_id = ? ORDER BY created_at DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/**
 * ─── CALC WEIGHTED REPUTATION ─────────────────────────────
 * Verified reviews count for 2x weight.
 */
function updateReputationScore(userId) {
  const sql = `SELECT rating, is_verified FROM reviews WHERE reviewee_id = ?`;
  db.query(sql, [userId], (err, reviews) => {
    if (err || reviews.length === 0) return;

    let totalPoints = 0;
    let totalWeight = 0;

    reviews.forEach((r) => {
      const weight = r.is_verified ? 2 : 1;
      totalPoints += r.rating * weight;
      totalWeight += weight;
    });

    const reputationScore = (totalPoints / totalWeight).toFixed(2);

    db.query("UPDATE users SET reputation_score = ? WHERE id = ?", [reputationScore, userId]);
  });
}

module.exports = router;
