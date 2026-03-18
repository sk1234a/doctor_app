const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ✅ REQUEST WITHDRAW
router.post("/request", async (req, res) => {
  try {
    const {
      user_id,
      amount,
      method,
      accountNumber,
      ifscCode,
      upiId,
      accountHolder,
      bankName
    } = req.body;

    // ✅ validation
    if (!user_id || !amount || !method) {
      return res.json({
        success: false,
        message: "user_id, amount, method are required"
      });
    }

    if (amount <= 0) {
      return res.json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // ✅ check method
    if (!["bank_transfer", "upiId"].includes(method)) {
      return res.json({
        success: false,
        message: "Invalid withdraw method"
      });
    }

    // ✅ check user exist
    const [user] = await db.query("SELECT id FROM users WHERE id = ?", [user_id]);

    if (user.length === 0) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ bank validation
    if (method === "bank_transfer") {
      if (!accountNumber || !ifscCode || !accountHolder || !bankName) {
        return res.json({
          success: false,
          message: "Bank details required"
        });
      }
    }

    // ✅ upi validation
    if (method === "upiId") {
      if (!upiId) {
        return res.json({
          success: false,
          message: "UPI ID required"
        });
      }
    }

    await db.query(
      `INSERT INTO withdraws 
      (user_id, amount, method, accountNumber, ifscCode, upiId, accountHolder, bankName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        amount,
        method,
        accountNumber || null,
        ifscCode || null,
        upiId || null,
        accountHolder || null,
        bankName || null
      ]
    );

    res.json({
      success: true,
      message: "Withdraw request sent successfully",
      statusCode: 200
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ✅ GET USER WITHDRAWS
router.get("/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const [rows] = await db.query(
      "SELECT * FROM withdraws WHERE user_id = ? ORDER BY createdAt DESC",
      [user_id]
    );

    res.json({
      success: true,
      data: rows,
      message: "Withdraw history fetched",
      statusCode: 200
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;