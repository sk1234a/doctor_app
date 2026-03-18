const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= ADD COLLECTION =================
router.post("/add", (req, res) => {
  const { name, public_id, image_url } = req.body;

  // Validation
  if (!name || !image_url) {
    return res.status(400).json({
      success: false,
      message: "Name and image_url are required",
      statusCode: 400
    });
  }

  const sql = `
    INSERT INTO collections (name, public_id, image_url)
    VALUES (?,?,?)
  `;

  db.query(sql, [name, public_id || null, image_url], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
        statusCode: 500
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        public_id,
        image_url
      },
      message: "Collection added successfully",
      statusCode: 201
    });
  });
});


// ================= GET COLLECTIONS =================
router.get("/", (req, res) => {

  const sql = `SELECT * FROM collections ORDER BY id DESC`;

  db.query(sql, (err, data) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
        statusCode: 500
      });
    }

    res.status(200).json({
      success: true,
      data,
      message: "Collections fetched successfully",
      statusCode: 200
    });

  });
});

module.exports = router;