const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CREATE TRANSACTION
router.post("/create", async (req, res) => {
  try {
    const {
      user_id,
      amount,
      currency = "INR",
      status = "pending",
      gateway,
      transactionId,
      orderId,
      razorpayPaymentDetails
    } = req.body;

    // ✅ Validation
    if (!user_id || !amount || !gateway || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // ✅ Check duplicate transactionId
    const [existing] = await db.query(
      "SELECT id FROM transactions WHERE transactionId = ?",
      [transactionId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Transaction already exists"
      });
    }

    // ✅ Insert
    const [result] = await db.query(
      `INSERT INTO transactions 
      (user_id, amount, currency, status, gateway, transactionId, orderId, razorpayPaymentDetails, transactionDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        amount,
        currency,
        status,
        gateway,
        transactionId,
        orderId,
        razorpayPaymentDetails || null
      ]
    );

    res.json({
      success: true,
      message: "Transaction created successfully",
      data: {
        id: result.insertId,
        transactionId
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});


// GET USER TRANSACTIONS
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY createdAt DESC",
      [user_id]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: err.message
    });
  }
});

module.exports = router;