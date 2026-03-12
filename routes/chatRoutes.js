const express = require("express");
const router = express.Router();

const chatController=require("../controllers/chatController");

router.post("/consult",chatController.consultAI);

module.exports=router;