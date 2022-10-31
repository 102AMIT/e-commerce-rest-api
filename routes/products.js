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

//  here we are updating the product
// now we are using middleware for verify admin 
router.put("/:id",verifyTokenAndAdmin,async(req,res)=>{

    try{
        const updatedProduct=await Product.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true});
            res.status(200).json(updatedProduct);
    }catch(err){
        res.status(500).json(err);
    }
});



// Delete user methode

router.delete("/:id", verifyTokenAndAdmin,async (req,res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json("Product has been deleted");
    }catch(err){
        res.status(500).json(err,"error in deleting Product");
    }
});

// // Get Product methode

router.get("/find/:id",async (req,res)=>{
    try{
        const product=await Product.findById(req.params.id)
        res.status(200).json(product);
    }catch(err){
        res.status(500).json(err,"error in Getting product");
    }
});


// Get all Product


router.get("/",async (req,res)=>{
    // if we want to get recent 5 user then we need to pass query ?new=true for that we are using limit
    const qNew=req.query.new;
    const qCategory=req.query.category;
    try{
        // we are creating array here ,here we can find the product's and also get the product by category
        let products;

        if(qNew){
            products=await Product.find().sort({createdAt:-1}).limit(qNew);
        }else if(qCategory){
            // if here categories query inside the array then we fetch this from array 
            products=await Product.find({categories:{
                $in:[qCategory],
            },
        });
        }else{
            products=await Product.find();
        }
        res.status(200).json(products);
    

    }catch(err){
        res.status(500).json(err,"error in Getting users");
    }
});



module.exports=router;