const db = require("../config/db");
const {v4:uuid}=require("uuid")

exports.bookAppointment=(req,res)=>{

const {doctor_id,patient_id,date,time,type,amount}=req.body;

const appointmentId="APT-"+uuid()

db.query(

`INSERT INTO appointments
(appointmentId,doctor_id,patient_id,date,time,type,amount)
VALUES(?,?,?,?,?,?,?)`,

[appointmentId,doctor_id,patient_id,date,time,type,amount],

(err,result)=>{

res.json({

success:true,
message:"Appointment booked",

data:{
appointmentId:appointmentId
}

})

})

}