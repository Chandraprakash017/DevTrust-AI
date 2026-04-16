const express = require("express");
const router = express.Router();

const {
  addNotification,
  getNotifications,
} = require("../controllers/notificationController");

router.post("/", addNotification);
router.get("/:id", getNotifications);

module.exports = router;