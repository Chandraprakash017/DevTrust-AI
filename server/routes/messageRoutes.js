const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer Setup for Chat Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/chat";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `file-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Get Messages
router.get("/:senderId/:receiverId", (req, res) => {
  const { senderId, receiverId } = req.params;
  const sql = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?) 
    ORDER BY created_at ASC`;
  db.query(sql, [senderId, receiverId, receiverId, senderId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Send Message with Optional File
router.post("/", upload.single("file"), (req, res) => {
  const { senderId, receiverId, message } = req.body;
  const fileUrl = req.file ? req.file.path : null;
  const fileName = req.file ? req.file.originalname : null;
  const fileType = req.file ? req.file.mimetype : null;

  const sql = "INSERT INTO messages (sender_id, receiver_id, message, file_url, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [senderId, receiverId, message, fileUrl, fileName, fileType], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, senderId, receiverId, message, fileUrl, fileName, fileType });
  });
});

module.exports = router;