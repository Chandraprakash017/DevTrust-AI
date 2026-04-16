const db = require("../config/db");

// GET ALL TRAININGS
exports.getTrainings = (req, res) => {
  db.query("SELECT * FROM trainings ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ADD TRAINING
exports.addTraining = (req, res) => {
  const { title, description, level } = req.body;

  if (!title) return res.status(400).json({ message: "Title required" });

  db.query(
    "INSERT INTO trainings (title, description, level) VALUES (?, ?, ?)",
    [title, description, level || "beginner"],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "✅ Training added", id: result.insertId });
    }
  );
};

// DELETE TRAINING
exports.deleteTraining = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM trainings WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Training deleted" });
  });
};