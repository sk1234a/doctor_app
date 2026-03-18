const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= GET ALL PRODUCTS =================
router.get("/", async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");

    for (let product of products) {
      const [images] = await db.query(
        "SELECT public_id, url FROM product_images WHERE product_id=?",
        [product.id]
      );

      const [categories] = await db.query(
        "SELECT category FROM product_categories WHERE product_id=?",
        [product.id]
      );

      product.images = images;
      product.categories = categories;
    }

    res.json({
      success: true,
      message: "Homepage products fetched successfully",
      statusCode: 200,
      data: {
        randomProducts: products,
        nutritionProducts: []
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= GET SINGLE PRODUCT =================
router.get("/:id", async (req, res) => {
  try {
    const [product] = await db.query(
      "SELECT * FROM products WHERE id=?",
      [req.params.id]
    );

    if (!product.length) {
      return res.json({
        success: false,
        message: "Product not found"
      });
    }

    const [images] = await db.query(
      "SELECT public_id, url FROM product_images WHERE product_id=?",
      [req.params.id]
    );

    const [categories] = await db.query(
      "SELECT category FROM product_categories WHERE product_id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Product fetched",
      data: {
        ...product[0],
        images,
        categories
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= ADD PRODUCT =================
router.post("/add", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      brand,
      stock,
      pack,
      unit,
      unitSize,
      isFeatured,
      images,        // [{public_id, url}]
      categories     // ["medicine", "nutrition"]
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO products 
      (name, description, price, salePrice, brand, stock, pack, unit, unitSize, isFeatured) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, salePrice, brand, stock, pack, unit, unitSize, isFeatured]
    );

    const productId = result.insertId;

    // insert images
    if (images && images.length > 0) {
      for (let img of images) {
        await db.query(
          "INSERT INTO product_images (product_id, public_id, url) VALUES (?, ?, ?)",
          [productId, img.public_id, img.url]
        );
      }
    }

    // insert categories
    if (categories && categories.length > 0) {
      for (let cat of categories) {
        await db.query(
          "INSERT INTO product_categories (product_id, category) VALUES (?, ?)",
          [productId, cat]
        );
      }
    }

    res.json({
      success: true,
      message: "Product added successfully",
      data: { productId }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


module.exports = router;