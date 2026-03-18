const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ✅ Add Review
router.post("/add", async (req, res) => {
  try {
    const { product_id, user_id, rating, reviewText } = req.body;

    // ✅ Validation
    if (!product_id || !user_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "product_id, user_id and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // ✅ Check duplicate review
    const [existing] = await db.query(
      "SELECT * FROM reviews WHERE product_id = ? AND user_id = ?",
      [product_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product"
      });
    }

    // ✅ Insert review
    const [result] = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, reviewText)
       VALUES (?, ?, ?, ?)`,
      [product_id, user_id, rating, reviewText]
    );

    res.json({
      success: true,
      message: "Review added successfully",
      data: {
        id: result.insertId,
        product_id,
        user_id,
        rating,
        reviewText
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ✅ Get Reviews by Product (with user info)
router.get("/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        r.id,
        r.rating,
        r.reviewText,
        r.createdAt,
        u.name as userName,
        u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.id DESC`,
      [product_id]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


module.exports = router;