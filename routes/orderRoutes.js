const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CREATE ORDER
router.post("/create", (req, res) => {
  const {
    user_id,
    totalAmount,
    items,
    paymentType,
    shippingAddress,
    couponCode = null,
    couponDiscount = 0
  } = req.body;

  const orderId = "ORD" + Date.now();

  db.beginTransaction(err => {
    if (err) {
      return res.json({ success: false, message: err });
    }

    // 1. Insert order
    db.query(
      `INSERT INTO orders 
      (user_id, orderId, totalAmount, paymentType, shippingAddress, couponCode, couponDiscount, paymentStatus, orderStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        orderId,
        totalAmount,
        paymentType,
        shippingAddress,
        couponCode,
        couponDiscount,
        "pending",
        "order placed"
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.json({ success: false, message: err });
          });
        }

        const order_id = result.insertId;

        // 2. Insert order items
        const itemQueries = items.map(item => {
          return new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
              [order_id, item.product_id, item.quantity, item.price],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(itemQueries)
          .then(() => {
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.json({ success: false, message: err });
                });
              }

              res.json({
                success: true,
                message: "Order placed successfully",
                data: {
                  orderId,
                  order_id,
                  totalAmount,
                  items
                }
              });
            });
          })
          .catch(err => {
            db.rollback(() => {
              res.json({ success: false, message: err });
            });
          });
      }
    );
  });
});


// GET USER ORDERS WITH ITEMS
router.get("/user/:id", (req, res) => {
  const user_id = req.params.id;

  db.query(
    "SELECT * FROM orders WHERE user_id=? ORDER BY id DESC",
    [user_id],
    (err, orders) => {
      if (err) return res.json({ success: false, message: err });

      const orderPromises = orders.map(order => {
        return new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM order_items WHERE order_id=?",
            [order.id],
            (err, items) => {
              if (err) reject(err);
              else {
                order.items = items;
                resolve(order);
              }
            }
          );
        });
      });

      Promise.all(orderPromises)
        .then(finalOrders => {
          res.json({
            success: true,
            message: "Orders fetched successfully",
            data: finalOrders
          });
        })
        .catch(err => {
          res.json({ success: false, message: err });
        });
    }
  );
});

module.exports = router;