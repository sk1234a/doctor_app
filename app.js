var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
require("dotenv").config();

var app = express();

// ✅ IMPORT ROUTES
var indexRouter = require('./routes/index');

const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const reviewRoutes = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");

const bankRoutes = require("./routes/bankRoutes");
const withdrawRoutes = require("./routes/withdrawRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const couponRoutes = require("./routes/couponRoutes");
 

const addressRoutes = require("./routes/addressRoutes");
const collectionRoutes = require("./routes/collectionRoutes");

// ✅ MIDDLEWARES
app.use(cors());
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ ROOT
app.use('/', indexRouter);

// ✅ USER
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/address", addressRoutes);

// ✅ DOCTOR & APPOINTMENT
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/appointment", appointmentRoutes);

// ✅ PRODUCT & CATEGORY
app.use("/api/v1/product", productRoutes);
 
app.use("/api/v1/collection", collectionRoutes);

// ✅ ORDER & PAYMENT
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/transaction", transactionRoutes);

// ✅ REVIEW
app.use("/api/v1/review", reviewRoutes);

// ✅ MESSAGE / CHAT
app.use("/api/v1/message", messageRoutes);

// ✅ BANK & WITHDRAW
app.use("/api/v1/bank", bankRoutes);
app.use("/api/v1/withdraw", withdrawRoutes);
app.use("/api/v1/coupon", couponRoutes);

// ❌ 404 HANDLER
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API not found"
  });
});

// ❌ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

module.exports = app;