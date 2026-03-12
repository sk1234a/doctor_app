const db = require("../config/db");

const Doctor = {

getAllDoctors:(callback)=>{

db.query(
`SELECT users.id,users.name,users.email,users.avatar,
doctors.specialization,doctors.experience,
doctors.hospital,doctors.education,
doctors.university,doctors.ratings,
doctors.totalReviews,doctors.verified
FROM users
JOIN doctors
ON users.id = doctors.user_id`,
callback
);

},

getDoctorById:(id,callback)=>{

db.query(
`SELECT users.id,users.name,users.email,users.avatar,
users.gender,users.bloodGroup,
doctors.specialization,doctors.experience,
doctors.hospital,doctors.education,
doctors.university,doctors.ratings,
doctors.totalReviews,doctors.totalAppointments,
doctors.verified
FROM users
JOIN doctors
ON users.id = doctors.user_id
WHERE users.id=?`,
[id],
callback
);

},

checkDoctorExists:(userId,callback)=>{

db.query(
"SELECT * FROM doctors WHERE user_id=?",
[userId],
callback
);

},

createDoctor:(data,callback)=>{

db.query(
`INSERT INTO doctors 
(user_id,specialization,experience,hospital,education,university)
VALUES (?,?,?,?,?,?)`,
[
data.user_id,
data.specialization,
data.experience,
data.hospital,
data.education,
data.university
],
callback
);

}

};

module.exports = Doctor;