// this is the short hand writting 

const Cart=require("../models/Cart");
const {verifyToken,verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken');

const router=require('express').Router();

// create a cart

router.post("/",verifyToken, async(req,res)=>{
    
        try{
            const newCart= await new Cart(req.body).save();
            res.status(200).json(newCart);
        }catch(err){
            res.status(500).json(err,"Error in creating cart");
        }
});

//  here we are updating the Cart
// now we are using middleware for verify user 
router.put("/:id",verifyTokenAndAuthorization,async(req,res)=>{

    try{
        const updatedCart=await Cart.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true});
            res.status(200).json(updatedCart);
    }catch(err){
        res.status(500).json(err,"Error in updating Cart");
    }
});



// Delete cart

router.delete("/:id", verifyTokenAndAuthorization,async (req,res)=>{
    try{
        await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json("Cart has been deleted");
    }catch(err){
        res.status(500).json(err,"error in deleting Cart");
    }
});

// // Get User cart methode

router.get("/find/:userId",verifyTokenAndAuthorization, async (req,res)=>{
    try{
        const cart=await Cart.findOne({userId:req.params.userId})
        res.status(200).json(cart);
    }catch(err){
        res.status(500).json(err,"error in Getting cart");
    }
});


// Get all cart of all user this is only accessable by admin

router.get("/",verifyTokenAndAdmin,async(req,res)=>{
    try{
        const carts=await Cart.find();
        res.status(200).json(carts);
    }catch(err){
        res.status(500).json(err,"Error in getting all user cart");
    }
})




module.exports=router;