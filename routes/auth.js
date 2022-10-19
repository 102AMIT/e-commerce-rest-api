const router=require('express').Router();

// here we need to require user because we are authonticate the user first 
const User=require("../models/User");


// Register

router.post("/register",async(req,res)=>{
    const newUser=new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
    });
    try{
        const savedUser=await newUser.save(); 
        // 201 is use for succesfully edited
        res.status(201).json(savedUser);
    }catch(err){
        res.status(500).json(err);
    }

})

module.exports=router;