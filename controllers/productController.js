exports.getProducts=(req,res)=>{

res.json({

success:true,
statusCode:200,
message:"Homepage products fetched successfully",

data:{
randomProducts:[],
nutritionProducts:[]
}

})

}