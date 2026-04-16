const db = require("../config/db");

// 🔔 ADD NOTIFICATION
exports.addNotification = (req, res) => {
  const { user_id, message } = req.body;

  db.query(
    "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
    [user_id, message],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Notification added" });
    }
  );
};

// 📥 GET NOTIFICATIONS
exports.getNotifications = (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json(result);
    }
  );
};