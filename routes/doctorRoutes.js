const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL DOCTORS
router.get("/get-doctors", (req, res) => {
  const sql = `
    SELECT 
      u.id as userId,
      d.id as doctorId,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      u.gender,
      d.specialization,
      d.experience,
      d.hospital,
      d.education,
      d.university,
      d.ratings,
      d.totalReviews,
      d.balance,
      d.totalAppointments,
      d.verified
    FROM users u
    JOIN doctors d ON u.id = d.user_id
  `;

  db.query(sql, (err, doctors) => {
    if (err) return res.status(500).json({ success: false, message: err });

    const doctorIds = doctors.map(d => d.doctorId);

    db.query(
      `SELECT * FROM doctor_availability WHERE doctor_id IN (?)`,
      [doctorIds],
      (err2, availability) => {

        const finalData = doctors.map(doc => ({
          ...doc,
          availability: availability.filter(a => a.doctor_id === doc.doctorId)
        }));

        res.json({
          success: true,
          message: "Doctors fetched successfully",
          data: {
            doctors: finalData,
            totalPages: 1,
            currentPage: 1
          }
        });
      }
    );
  });
});

// GET SINGLE DOCTOR
router.get("/get-doctor/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      u.id as userId,
      d.id as doctorId,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      u.gender,
      d.specialization,
      d.experience,
      d.hospital,
      d.education,
      d.university,
      d.ratings,
      d.totalReviews,
      d.balance,
      d.totalAppointments,
      d.verified
    FROM users u
    JOIN doctors d ON u.id = d.user_id
    WHERE d.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err || result.length === 0)
      return res.json({ success: false, message: "Doctor not found" });

    db.query(
      "SELECT day,startTime,endTime FROM doctor_availability WHERE doctor_id=?",
      [result[0].doctorId],
      (err2, availability) => {
        res.json({
          success: true,
          message: "fetched doctor data",
          data: {
            ...result[0],
            availability
          }
        });
      }
    );
  });
});

module.exports = router;