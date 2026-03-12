const jwt = require("jsonwebtoken");

exports.verifyToken = (req,res,next)=>{

const authHeader = req.headers.authorization || req.headers.Authorization;

console.log("HEADER:", authHeader);
console.log("SECRET:", process.env.JWT_SECRET);

if(!authHeader){
return res.status(401).json({
success:false,
message:"Token required"
});
}

const token = authHeader.split(" ")[1];

jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{

if(err){
return res.status(403).json({
success:false,
message:"Invalid or expired token"
});
}

req.user=decoded;
next();

});

};