const router=require('express').Router();

// here we need to require user because we are authonticate the user first 
const User=require("../models/User");
const CryptoJS=require("crypto-js");
const { json } = require('express');


// Register

router.post("/register",async(req,res)=>{
    const newUser=new User({
        username:req.body.username,
        email:req.body.email,
        // password:req.body.password,
        /***************************** */
        // For Encrypted the password we are using Crypto.js after that we can't see your password in original form 


        // The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). 
        // It was selected after a 5-year process where 15 competing designs were evaluated.

        // CryptoJS supports AES-128, AES-192, and AES-256. It will pick the variant by the size of the key you
        // pass in. If you use a passphrase, then it will generate a 256-bit key.
        // it's provide a hash code we need to save to DB that why we are write here toString() ,it's chnage in string 

        // here we are getting error so we need to run this on cmd 
        // npm install crypto-js --save
        // npm install @types/crypto-js
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASSWORD_SEC).toString(),
    });
    try{
        const savedUser=await newUser.save(); 
        // 201 is use for succesfully edited
        res.status(201).json(savedUser);
    }catch(err){
        res.status(500).json(err);
    }

});


// Login
router.post("/login",async(req,res)=> {
    try{

        const user=await User.findOne({username:req.body.username});

        if(!user){
            return res.status(401).json("Wrong user input");
        }
        // here i'm decrypt the password
        const hashedPassword=CryptoJS.AES.decrypt(user.password,process.env.PASSWORD_SEC);
        // store the password into string 
        const Originalpassword=hashedPassword.toString(CryptoJS.enc.Utf8);

        if(Originalpassword !=req.body.password){
            return res.status(401).json("Wrong user input");
        }
        // the hashedPassword is shown in db if we want to hide our password from db then we don't need to pass the password in db .for that we are using spread operator
        // when we are passing the user then in db the password is sote in _doc so for that we need to pass user._doc
        const { password ,...others}=user._doc;

        res.status(200).json(others);
    }catch(err){
        res.status(500).json(err);
    }
})





module.exports=router;