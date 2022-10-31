// this is the short hand writting 

const Product=require("../models/Product");
const {verifyToken,verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken');

const router=require('express').Router();

// create

router.post("/",verifyTokenAndAdmin, async(req,res)=>{
    // console.log(req.body);
    
        try{
            const newProduct= await new Product(req.body).save();
            
            // let newProduct=new Product(req.body);
            // const savedProduct=await newProduct.save();
            res.status(200).json(newProduct);
        }catch(err){
            res.status(500).json(err);
        }
});

// // here we are updating the user 
// // now we are using middleware for verify my token 
// router.put("/:id",verifyTokenAndAuthorization,async(req,res)=>{
//     if(req.body.password){
//         req.body.password=CryptoJS.AES.encrypt(
//             req.body.password,
//             process.env.PASS_SEC
//         ).toString()
//     }

//     try{
//         const updatedUser=await User.findByIdAndUpdate(req.params.id,{
//             $set:req.body
//         },{new:true});
//         res.status(200).json(updatedUser);
//     }catch(err){
//         res.status(500).json(err);
//     }
// });



// // Delete user methode

// router.delete("/:id", verifyTokenAndAuthorization,async (req,res)=>{
//     try{
//         await User.findByIdAndDelete(req.params.id)
//         res.status(200).json("User had been delete");
//     }catch(err){
//         res.status(500).json(err,"error in deleting");
//     }
// });

// // Get user methode

// router.get("/find/:id", verifyTokenAndAdmin,async (req,res)=>{
//     try{
//         const user=await User.findById(req.params.id)
//         const { password ,...others}=user._doc;

//         res.status(200).json(others);
//     }catch(err){
//         res.status(500).json(err,"error in Getting users");
//     }
// });


// // Get all users


// router.get("/", verifyTokenAndAdmin,async (req,res)=>{
//     // if we want to get recent 5 user then we need to pass query ?new=true for that we are using limit
//     const query=req.query.new;
//     try{
//         const users=query? await User.find().sort({_id:-1}).limit(query): await User.find();
//         res.status(200).json(users);
//     }catch(err){
//         res.status(500).json(err,"error in Getting users");
//     }
// });

// // Get user Stats
// // this function give us total number of user like 10 user in january so we can get it by date 
// router.get("/stats",verifyTokenAndAdmin,async(req,res)=>{
//     const date=new Date();
//     // it's return the last year today
//     const lastYear=new Date(date.setFullYear(date.getFullYear()-1));

//     try{
//         // here we are using mongo Db aggregate
//         const data=await User.aggregate([
//             // it's match the created date with current date 
//             // created date it's getting from mongoDb current date is last year 
//             {$match:{createdAt:{$gte:lastYear}}},
//             {
//                 $project:{
//                     // month is assign from db
//                     month:{$month:"$createdAt"},

//                 },
//             },
//             {
//                 $group:{
//                     _id:"$month",
//                     total:{$sum:1},
//                 }
//             }
            
//         ]);
//         res.status(200).json(data);

//     }catch(err){
//         res.status(500).json(err);
//     }
// });


// router.use('/register',require('./auth'));
module.exports=router;