const express = require("express");
const router = express.Router();
const { getTrainings, addTraining, deleteTraining } = require("../controllers/trainingController");

router.get("/", getTrainings);
router.post("/", addTraining);
router.delete("/:id", deleteTraining);

module.exports = router;