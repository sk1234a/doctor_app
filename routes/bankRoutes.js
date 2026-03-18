const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ADD BANK ACCOUNT
router.post("/add", (req, res) => {
  const {
    user_id,
    accountHolder,
    accountNumber,
    ifscCode,
    bankName,
    upiId,
    type = "bank",
    isDefault = false
  } = req.body;

  if (!user_id) {
    return res.json({
      success: false,
      message: "user_id is required"
    });
  }

  const sql = `
    INSERT INTO bank_accounts 
    (user_id, accountHolder, accountNumber, ifscCode, bankName, upiId, type, isDefault)
    VALUES (?,?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [user_id, accountHolder, accountNumber, ifscCode, bankName, upiId, type, isDefault],
    (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Bank account added successfully",
        accountId: result.insertId
      });
    }
  );
});


// GET USER BANK ACCOUNTS
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;

  db.query(
    "SELECT * FROM bank_accounts WHERE user_id=?",
    [user_id],
    (err, data) => {
      if (err) {
        return res.json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      res.json({
        success: true,
        count: data.length,
        data
      });
    }
  );
});

module.exports = router;