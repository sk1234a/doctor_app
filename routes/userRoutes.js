const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");


// ✅ CREATE USER (SIGNUP)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, isDoctor, gender } = req.body;

    const [exist] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (exist.length > 0) {
      return res.json({
        success: false,
        message: "Email or Phone already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, password, phone, role, isDoctor, gender)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, role || "patient", isDoctor || false, gender]
    );

    res.json({
      success: true,
      message: "User created successfully",
      statusCode: 200
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ LOGIN (EMAIL / PHONE)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [identifier, identifier]
    );

    if (user.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const foundUser = user[0];

    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const [address] = await db.query(
      "SELECT * FROM user_addresses WHERE user_id = ?",
      [foundUser.id]
    );

    res.json({
      success: true,
      message: "Login successful",
      statusCode: 200,
      data: {
        _id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        avatar: foundUser.avatar || "",
        role: foundUser.role,
        isDoctor: !!foundUser.isDoctor,
        gender: foundUser.gender,
        address,
        token: "dummy_token_123"
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ FORGOT PASSWORD (EMAIL / PHONE)
router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [identifier, identifier]
    );

    if (user.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // delete old OTPs
    await db.query("DELETE FROM password_resets WHERE email = ?", [user[0].email]);

    await db.query(
      "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)",
      [user[0].email, otp, expires]
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
      data: { otp } // testing only
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [identifier, identifier]
    );

    if (user.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const email = user[0].email;

    const [record] = await db.query(
      "SELECT * FROM password_resets WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1",
      [email, otp]
    );

    if (record.length === 0) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(record[0].expires_at) < new Date()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [identifier, identifier]
    );

    if (user.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=? WHERE id=?",
      [hashedPassword, user[0].id]
    );

    // delete OTP after reset
    await db.query("DELETE FROM password_resets WHERE email = ?", [user[0].email]);

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;