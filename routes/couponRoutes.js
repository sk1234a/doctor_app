const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= CREATE COUPON =================
router.post("/create", (req, res) => {
  const {
    code,
    name,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscount,
    usageLimitPerUser,
    totalUsageLimit,
    startDate,
    expiresAt
  } = req.body;

  const sql = `
    INSERT INTO coupons
    (code, name, discountType, discountValue, minOrderValue, maxDiscount, usageLimitPerUser, totalUsageLimit, startDate, expiresAt)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      code,
      name,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimitPerUser || 1,
      totalUsageLimit || 1000,
      startDate,
      expiresAt
    ],
    (err) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message,
          statusCode: 500
        });
      }

      res.json({
        success: true,
        message: "Coupon created successfully",
        statusCode: 200
      });
    }
  );
});


// ================= APPLY COUPON =================
router.post("/apply", (req, res) => {
  const { code, amount } = req.body;

  db.query(
    "SELECT * FROM coupons WHERE code=? AND isActive=1",
    [code],
    (err, result) => {

      if (err) {
        return res.json({
          success: false,
          message: err.message,
          statusCode: 500
        });
      }

      if (!result.length) {
        return res.json({
          success: false,
          message: "Invalid coupon",
          statusCode: 400
        });
      }

      const coupon = result[0];
      const now = new Date();

      // 🔴 Expiry check
      if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
        return res.json({
          success: false,
          message: "Coupon expired",
          statusCode: 400
        });
      }

      // 🔴 Start date check
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        return res.json({
          success: false,
          message: "Coupon not active yet",
          statusCode: 400
        });
      }

      // 🔴 Minimum amount check
      if (amount < coupon.minOrderValue) {
        return res.json({
          success: false,
          message: `Minimum order should be ${coupon.minOrderValue}`,
          statusCode: 400
        });
      }

      // 🔴 Usage limit check
      if (coupon.usedCount >= coupon.totalUsageLimit) {
        return res.json({
          success: false,
          message: "Coupon usage limit exceeded",
          statusCode: 400
        });
      }

      let discount = 0;

      // 🔴 Discount calculation
      if (coupon.discountType === "percentage") {
        discount = (amount * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }

      // 🔴 Max discount apply
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }

      const finalAmount = amount - discount;

      res.json({
        success: true,
        statusCode: 200,
        message: "Coupon applied successfully",
        data: {
          originalAmount: amount,
          discount,
          finalAmount
        }
      });
    }
  );
});


// ================= UPDATE USAGE AFTER ORDER =================
router.post("/use", (req, res) => {
  const { code } = req.body;

  db.query(
    "UPDATE coupons SET usedCount = usedCount + 1 WHERE code=?",
    [code],
    (err) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: "Coupon usage updated"
      });
    }
  );
});

module.exports = router;