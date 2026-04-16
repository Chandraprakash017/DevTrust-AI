const db = require("../config/db");

// Upload
exports.uploadDoc = (req, res) => {
  const { user_id, document_url } = req.body;

  db.query(
    "INSERT INTO verification (user_id, document_url) VALUES (?, ?)",
    [user_id, document_url],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Document uploaded 📄" });
    }
  );
};

// Admin approve
exports.updateStatus = (req, res) => {
  const { id, status } = req.body;

  db.query(
    "UPDATE verification SET status = ? WHERE id = ?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated ✅" });
    }
  );
};