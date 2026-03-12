const Doctor = require("../models/doctorModel");



// Get all doctors
exports.getDoctors = (req,res)=>{

Doctor.getAllDoctors((err,result)=>{

if(err){
return res.status(500).json({
success:false,
message:"Database error",
error:err
});
}

res.json({
success:true,
statusCode:200,
message:"Doctors fetched successfully",
data:{
doctors:result,
totalPages:1,
currentPage:1
}
});

});

};



// Get single doctor
exports.getDoctor = (req,res)=>{

const id = req.params.id;

Doctor.getDoctorById(id,(err,result)=>{

if(err){
return res.status(500).json({
success:false,
message:"Database error"
});
}

if(result.length === 0){
return res.json({
success:false,
message:"Doctor not found"
});
}

res.json({
success:true,
statusCode:200,
message:"Doctor data fetched",
data:result[0]
});

});

};



// Create doctor profile
exports.addDoctor = (req,res)=>{

const userId = req.user.id;

const {
specialization,
experience,
hospital,
education,
university
} = req.body;



Doctor.checkDoctorExists(userId,(err,checkResult)=>{

if(checkResult.length > 0){
return res.json({
success:false,
message:"Doctor profile already exists"
});
}


const doctorData = {
user_id:userId,
specialization,
experience,
hospital,
education,
university
};


Doctor.createDoctor(doctorData,(err,result)=>{

if(err){
return res.status(500).json({
success:false,
message:"Doctor profile creation failed",
error:err
});
}

res.json({
success:true,
statusCode:200,
message:"Doctor profile created successfully",
data:{
doctorId:result.insertId
}
});

});

});

};