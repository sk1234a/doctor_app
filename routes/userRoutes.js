const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctorController");
const { verifyToken } = require("../middleware/authMiddleware");

// doctor profile create
router.post("/add-doctor", verifyToken, doctorController.addDoctor);

// doctor list
router.get("/get-doctors", verifyToken, doctorController.getDoctors);

// single doctor
router.get("/get-doctor/:id", verifyToken, doctorController.getDoctor);

module.exports = router;