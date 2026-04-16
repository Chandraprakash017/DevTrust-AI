const db = require("../config/db");

// 💰 SAVE PAYMENT
exports.addEarning = (req, res) => {
  const { user_id, amount, source } = req.body;

  db.query(
    "INSERT INTO earnings (user_id, amount, source) VALUES (?, ?, ?)",
    [user_id, amount, source],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Earning added" });
    }
  );
};

// 📊 GET EARNINGS
exports.getEarnings = (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT * FROM earnings WHERE user_id=? ORDER BY id DESC",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json(result);
    }
  );
};