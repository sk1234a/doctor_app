const db = require("../config/db");

const User = {

 // Find user by email or phone (Login)
 findUser: (identifier, callback) => {

  db.query(
   "SELECT * FROM users WHERE email=? OR phone=?",
   [identifier, identifier],
   callback
  );

 },

 // Create new user (Register)
 createUser: (data, callback) => {

  db.query(
   "INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)",
   [data.name, data.email, data.password, data.phone, data.role],
   callback
  );

 },

 // Find user by email
 findUserByEmail: (email, callback) => {

  db.query(
   "SELECT * FROM users WHERE email=?",
   [email],
   callback
  );

 },

 // Update password
 updatePassword: (email, password, callback) => {

  db.query(
   "UPDATE users SET password=? WHERE email=?",
   [password, email],
   callback
  );

 },

 // Save OTP for forgot password
 saveOTP: (email, otp, expires, callback) => {

  db.query(
   "INSERT INTO password_resets (email,otp,expires_at) VALUES (?,?,?)",
   [email, otp, expires],
   callback
  );

 },

 // Verify OTP
 verifyOTP: (email, otp, callback) => {

  db.query(
   "SELECT * FROM password_resets WHERE email=? AND otp=?",
   [email, otp],
   callback
  );

 }

};

module.exports = User;