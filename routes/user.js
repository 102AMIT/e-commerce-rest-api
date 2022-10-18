const express=require('express');
const router=express.Router();

router.get('/test1',(req,res)=>{
    res.send("router is working");
});

router.post('/username',(req,res)=>{
    const username=req.body.username;
    console.log(username);
    res.send(`your user name is : ${username}`);
})

module.exports=router;