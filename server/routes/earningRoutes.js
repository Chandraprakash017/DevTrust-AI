const express = require("express");
const router = express.Router();

const {
  addEarning,
  getEarnings,
} = require("../controllers/earningController");

router.post("/", addEarning);
router.get("/:id", getEarnings);

module.exports = router;