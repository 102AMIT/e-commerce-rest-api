const { verify } = require('jsonwebtoken');
const User = require('../models/User');
const {verifyToken,verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken');

const router=require('express').Router();

// here we are updating the user 
// now we are using middleware for verify my token 
router.put("/:id",verifyTokenAndAuthorization,async(req,res)=>{
    if(req.body.password){
        req.body.password=CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString()
    }

    try{
        const updatedUser=await User.findByIdAndUpdate(req.params.id,{
            $set:req.body
        },{new:true});
        res.status(200).json(updatedUser);
    }catch(err){
        res.status(500).json(err);
    }
});



// Delete user methode

router.delete("/:id", verifyTokenAndAuthorization,async (req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User had been delete");
    }catch(err){
        res.status(500).json(err,"error in deleting");
    }
});

// Get user methode

router.get("/find/:id", verifyTokenAndAdmin,async (req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        const { password ,...others}=user._doc;

        res.status(200).json(others);
    }catch(err){
        res.status(500).json(err,"error in Getting users");
    }
});


// router.use('/register',require('./auth'));
module.exports=router;