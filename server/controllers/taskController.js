const db = require("../config/db");

// saare tasks laao
exports.getTasks = (req, res) => {
  db.query("SELECT * FROM tasks ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// task jodo
exports.addTask = (req, res) => {
  const { title, description, reward, difficulty } = req.body;

  if (!title) return res.status(400).json({ message: "Title required" });

  db.query(
    "INSERT INTO tasks (title, description, reward, difficulty) VALUES (?, ?, ?, ?)",
    [title, description, reward || 0, difficulty || "easy"],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "✅ Task added", id: result.insertId });
    }
  );
};

// task hatao
exports.deleteTask = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Task deleted" });
  });
};