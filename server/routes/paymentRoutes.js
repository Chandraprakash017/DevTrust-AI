const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getPayments, subscribe } = require("../controllers/paymentController");
const db = require("../config/db");

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/subscribe", subscribe);
router.get("/history/:id", getPayments);

/**
 * ─── CREATE ESCROW PAYMENT ──────────────────────────────
 */
router.post("/escrow/create", (req, res) => {
  const { task_id, client_id, freelancer_id, amount } = req.body;
  const sql = `INSERT INTO escrow_payments (task_id, client_id, freelancer_id, amount, status) VALUES (?, ?, ?, ?, 'held')`;
  db.query(sql, [task_id, client_id, freelancer_id, amount], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Funds held in Escrow successfully!", escrowId: result.insertId });
  });
});

/**
 * ─── RELEASE ESCROW PAYMENT ─────────────────────────────
 */
router.post("/escrow/release", (req, res) => {
  const { escrow_id } = req.body;
  
  db.query("SELECT * FROM escrow_payments WHERE id = ?", [escrow_id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "Escrow not found" });
    
    const escrow = results[0];
    if (escrow.status !== "held") return res.status(400).json({ message: "Payment already released or disputed" });

    db.query("UPDATE escrow_payments SET status = 'released' WHERE id = ?", [escrow_id], () => {
      db.query(
        "INSERT INTO earnings (user_id, amount, source) VALUES (?, ?, ?)",
        [escrow.freelancer_id, escrow.amount, `Task Completion (Escrow #${escrow_id})`],
        () => {
          res.json({ message: "Payment released to freelancer!" });
        }
      );
    });
  });
});

module.exports = router;