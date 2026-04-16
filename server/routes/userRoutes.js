const express = require("express");
const router = express.Router();
const { getUsers, getStats, createAdmin } = require("../controllers/authController");
const { getProfile, updateProfile } = require("../controllers/userController");

router.get("/", getUsers);
router.get("/stats", getStats);
router.post("/create-admin", createAdmin);
router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);

module.exports = router;
