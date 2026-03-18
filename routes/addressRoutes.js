const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ================= ADD ADDRESS =================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id; // token se user

    const {
      name,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;

    // agar default true hai to pehle purane default hatao
    if (isDefault) {
      await db.query(
        "UPDATE user_addresses SET isDefault = false WHERE user_id = ?",
        [user_id]
      );
    }

    const [result] = await db.query(
      `INSERT INTO user_addresses 
      (user_id, name, phone, alternatePhone, addressLine1, addressLine2, city, state, postalCode, country, isDefault)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        name,
        phone,
        alternatePhone || null,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        postalCode,
        country || "India",
        isDefault || false
      ]
    );

    res.json({
      success: true,
      message: "Address added successfully",
      data: { id: result.insertId }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= GET USER ADDRESSES =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY isDefault DESC",
      [user_id]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= DELETE ADDRESS =================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    await db.query(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [req.params.id, user_id]
    );

    res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= UPDATE ADDRESS =================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      name,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;

    if (isDefault) {
      await db.query(
        "UPDATE user_addresses SET isDefault = false WHERE user_id = ?",
        [user_id]
      );
    }

    await db.query(
      `UPDATE user_addresses SET 
        name=?, phone=?, alternatePhone=?, addressLine1=?, addressLine2=?, 
        city=?, state=?, postalCode=?, country=?, isDefault=?
       WHERE id=? AND user_id=?`,
      [
        name,
        phone,
        alternatePhone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
        req.params.id,
        user_id
      ]
    );

    res.json({
      success: true,
      message: "Address updated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;