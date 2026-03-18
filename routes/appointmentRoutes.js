const express = require("express");
const router = express.Router();
const db = require("../config/db");

// BOOK APPOINTMENT
router.post("/book", (req, res) => {
  const { doctor_id, patient_id, date, time, amount } = req.body;

  if (!doctor_id || !patient_id || !date || !time) {
    return res.json({
      success: false,
      message: "All fields are required"
    });
  }

  // CHECK SLOT ALREADY BOOKED
  const checkSql = `
    SELECT * FROM appointments
    WHERE doctor_id = ? AND date = ? AND time = ?
    AND status != 'cancelled'
  `;

  db.query(checkSql, [doctor_id, date, time], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err });
    }

    if (result.length > 0) {
      return res.json({
        success: false,
        message: "Slot already booked"
      });
    }

    const appointmentId = "APT" + Date.now();

    const insertSql = `
      INSERT INTO appointments
      (appointmentId, doctor_id, patient_id, date, time, amount)
      VALUES (?,?,?,?,?,?)
    `;

    db.query(
      insertSql,
      [appointmentId, doctor_id, patient_id, date, time, amount],
      (err) => {
        if (err) {
          return res.json({ success: false, message: err });
        }

        res.json({
          success: true,
          message: "Appointment booked successfully",
          data: { appointmentId }
        });
      }
    );
  });
});


// GET USER APPOINTMENTS
router.get("/user/:id", (req, res) => {
  const sql = `
    SELECT a.*, u.name as doctor_name
    FROM appointments a
    JOIN users u ON a.doctor_id = u.id
    WHERE a.patient_id = ?
    ORDER BY a.createdAt DESC
  `;

  db.query(sql, [req.params.id], (err, data) => {
    if (err) {
      return res.json({ success: false, message: err });
    }

    res.json({
      success: true,
      data,
      message: "Appointments fetched"
    });
  });
});

module.exports = router;