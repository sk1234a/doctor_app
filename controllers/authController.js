const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = (req,res)=>{

const {identifier,password} = req.body;

User.findUser(identifier, async(err,result)=>{

if(result.length==0){
return res.json({
success:false,
message:"User not found"
})
}

const user=result[0];

const match=await bcrypt.compare(password,user.password);

if(!match){
return res.json({
success:false,
message:"Wrong password"
})
}

const token = jwt.sign(
{
id:user.id,
role:user.role,
email:user.email,
name:user.name
},
process.env.JWT_SECRET
);

res.json({
success:true,
statusCode:200,
message:"Login successful",
data:{
...user,
token
}
})

})

}

exports.register = async (req,res)=>{

const {name,email,password,phone,role} = req.body;

const hashedPassword = await bcrypt.hash(password,10);

User.createUser(
{
name,
email,
password:hashedPassword,
phone,
role
},
(err,result)=>{

if(err){
return res.json({
success:false,
message:"User registration failed"
})
}

res.json({
success:true,
message:"User registered successfully"
})

}

)

};

exports.forgotPassword = (req,res)=>{

const {email} = req.body;

User.findUserByEmail(email,(err,user)=>{

if(user.length==0){
return res.json({
success:false,
message:"Email not found"
})
}

const otp = Math.floor(100000 + Math.random()*900000);

const expires = new Date(Date.now()+10*60*1000);

User.saveOTP(email,otp,expires,(err,result)=>{

res.json({
success:true,
message:"OTP sent to email",
otp:otp
})

})

})

};

exports.resetPassword = async(req,res)=>{

const {email,otp,newPassword} = req.body;

User.verifyOTP(email,otp,async(err,result)=>{

if(result.length==0){

return res.json({
success:false,
message:"Invalid OTP"
})

}

const hashedPassword = await bcrypt.hash(newPassword,10);

User.updatePassword(email,hashedPassword,(err,update)=>{

res.json({
success:true,
message:"Password reset successfully"
})

})

})

};

