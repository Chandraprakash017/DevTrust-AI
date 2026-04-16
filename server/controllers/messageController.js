const db = require("../config/db");

exports.saveMessage = (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  db.query(
    "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
    [sender_id, receiver_id, message],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
};

exports.getMessages = (req, res) => {
  const { senderId, receiverId } = req.params;

  db.query(
    "SELECT * FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)",
    [senderId, receiverId, receiverId, senderId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};