// this is the short hand writting 

const Order=require("../models/Order");
const {verifyToken,verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken');

const router=require('express').Router();

// create a order

router.post("/",verifyToken, async(req,res)=>{
    
        try{
            const newOrder= await new Order(req.body).save();
            res.status(200).json(newOrder);
        }catch(err){
            res.status(500).json(err,"Error in creating order");
        }
});

//  here we are updating the order
// now we are using middleware for verify admin 
router.put("/:id",verifyTokenAndAdmin,async(req,res)=>{

    try{
        const updatedOrder=await Order.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true});
            res.status(200).json(updatedOrder);
    }catch(err){
        res.status(500).json(err,"Error in updating Order");
    }
});



// Delete Order

router.delete("/:id", verifyTokenAndAdmin,async (req,res)=>{
    try{
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json("Order has been deleted");
    }catch(err){
        res.status(500).json(err,"error in deleting Order");
    }
});

// // Get User order methode

router.get("/find/:userId",verifyTokenAndAuthorization, async (req,res)=>{
    try{
        const orders=await Order.find({userId:req.params.userId})
        res.status(200).json(orders);
    }catch(err){
        res.status(500).json(err,"error in Getting cart");
    }
});


// Get all order of all user this is only accessable by admin

router.get("/",verifyTokenAndAdmin,async(req,res)=>{
    try{
        const orders=await Order.find();
        res.status(200).json(orders);
    }catch(err){
        res.status(500).json(err,"Error in getting all user cart");
    }
});

// Get Monthly income

router.get("/income",verifyTokenAndAdmin,async(req,res)=>{
    // here we are geeting the income of two month current month and previous month
    const date=new Date();//if 1st september

    const lastMonth=new Date(date.setMonth(date.getMonth()-1));//then it's 1st august 
    const previousMonth=new Date(new Date().setMonth(date.getMonth()-1));//then it's 1st july

    try{

        // applying aggregate here

        const income=await Order.aggregate([
            {$match:{createdAt:{$gte:previousMonth}}},
            {
                $project:{

                month:{$month:"$createdAt"},
                sales:"$amount",
                },
            },
                {
                    $group:{
                        _id:"$month",
                        total:{$sum:"$sales"}
                    },
                },
            
        ]);
        res.status(200).json(income);

    }catch(err){
        res.status(500).json(err,"Error in getting the monthly income");
    }


});




module.exports=router;