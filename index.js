const express=require("express");
const { default: mongoose } = require("mongoose");
const app=express();
const dotenv=require("dotenv");
// here we are using dotenv so we need to write dotenv.config().
dotenv.config();
// we are using out secrate key of mongoDb
// mongoose.connect return us a promisses  
mongoose.connect(process.env.DB_URL)
.then(()=>console.log("DB connected successfull"))
.catch((err)=>{
    console.log(err);
})

// we need to write port number because we are using dont env file
// if we have no port number in env file then we need to specified here by using || and port number  
app.listen(process.env.port || 8000,()=>{
    console.log(`Server is running up on port : ${8000}`);
})