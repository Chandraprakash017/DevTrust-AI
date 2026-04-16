const db = require("../config/db");

// 🎭 MOCK PAYMENT – Create Order (No real payment gateway)
exports.createOrder = (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  // Simulate order creation
  const mockOrder = {
    id: "mock_order_" + Date.now(),
    amount: amount * 100, // in paise (like Razorpay format)
    currency: "INR",
    status: "created",
  };

  res.json(mockOrder);
};

// ✅ MOCK PAYMENT – Verify / Confirm Payment & Save Earning
exports.verifyPayment = (req, res) => {
  const { user_id, amount, source } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({ message: "user_id and amount required" });
  }

  // Save earning to DB
  db.query(
    "INSERT INTO earnings (user_id, amount, source) VALUES (?, ?, ?)",
    [user_id, amount, source || "Payment"],
    (err) => {
      if (err) return res.status(500).json(err);

      // Add a notification
      db.query(
        "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        [user_id, `✅ Payment of ₹${amount} received for ${source || "Payment"}`],
        () => {}
      );

      res.json({ success: true, message: "Payment confirmed & earning saved" });
    }
  );
};

// 🚀 SUBSCRIBE – Upgrade User to Pro
exports.subscribe = (req, res) => {
  const { user_id, amount, plan, transaction_id } = req.body;

  if (!user_id || !amount || plan !== "pro") {
    return res.status(400).json({ message: "Invalid subscription details" });
  }

  // 1. Update user plan
  db.query(
    "UPDATE users SET plan = ? WHERE id = ?",
    ["pro", user_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to update user plan", error: err });

      // 2. Log subscription
      db.query(
        "INSERT INTO subscriptions (user_id, plan, amount, transaction_id) VALUES (?, ?, ?, ?)",
        [user_id, "pro", amount, transaction_id || "mock_txn_" + Date.now()],
        (err) => {
          if (err) console.error("Subscription Log Error:", err);

          // 3. Add notification
          db.query(
            "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
            [user_id, "🌟 Welcome to DevTrust Pro! You now have access to all premium GenAI features."],
            () => {}
          );

          res.json({ success: true, message: "Successfully upgraded to PRO! 🚀" });
        }
      );
    }
  );
};

// 📊 GET payment / earning history
exports.getPayments = (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT * FROM earnings WHERE user_id = ? ORDER BY id DESC",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};