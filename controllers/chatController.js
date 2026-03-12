exports.consultAI = (req,res)=>{

const {symptoms}=req.body;

res.json({

success:true,
message:"AI consultation response",

data:{
symptoms:symptoms,
suggestion:"Please consult doctor"
}

})

}