const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CREATE PAYMENT
router.post("/pay", (req, res) => {
  const { user_id, order_id, amount, paymentMethod } = req.body;

  if (!user_id || !order_id || !amount || !paymentMethod) {
    return res.json({
      success: false,
      message: "All fields are required",
      statusCode: 400
    });
  }

  const transactionId = "TXN" + Date.now();

  // check order exists
  db.query("SELECT * FROM orders WHERE id=?", [order_id], (err, order) => {
    if (err) return res.json({ success: false, message: err });

    if (!order.length) {
      return res.json({
        success: false,
        message: "Order not found",
        statusCode: 404
      });
    }

    // INSERT PAYMENT
    db.query(
      `INSERT INTO payments 
      (user_id, order_id, paymentMethod, transactionId, amount, currency, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, order_id, paymentMethod, transactionId, amount, "INR", "completed"],
      (err2) => {
        if (err2) {
          return res.json({
            success: false,
            message: err2,
            statusCode: 500
          });
        }

        // UPDATE ORDER STATUS
        db.query(
          "UPDATE orders SET paymentStatus='paid' WHERE id=?",
          [order_id]
        );

        res.json({
          success: true,
          message: "Payment successful",
          statusCode: 200,
          data: {
            transactionId,
            order_id,
            amount,
            paymentMethod
          }
        });
      }
    );
  });
});


// GET PAYMENTS BY USER
router.get("/:user_id", (req, res) => {
  db.query(
    "SELECT * FROM payments WHERE user_id=? ORDER BY createdAt DESC",
    [req.params.user_id],
    (err, data) => {
      if (err) {
        return res.json({
          success: false,
          message: err,
          statusCode: 500
        });
      }

      res.json({
        success: true,
        message: "Payments fetched successfully",
        statusCode: 200,
        data
      });
    }
  );
});

module.exports = router;