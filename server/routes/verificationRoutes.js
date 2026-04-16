const express = require("express");
const router = express.Router();
const { uploadDoc, updateStatus } = require("../controllers/verificationController");

router.post("/upload", uploadDoc);
router.put("/status", updateStatus);

module.exports = router;
