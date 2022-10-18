const express=require("express");
const { default: mongoose } = require("mongoose");
const app=express();
const dotenv=require("dotenv");
const router=require('./routes/user');
// here we are using dotenv so we need to write dotenv.config().
dotenv.config();
// we are using out secrate key of mongoDb
// mongoose.connect return us a promisses  
mongoose.connect(process.env.DB_URL)
.then(()=>console.log("DB connected successfull"))
.catch((err)=>{
    console.log(err);
});

// we are using express.json() for taking input as json object
app.use(express.json());

app.use("/api/user",router);




// we need to write port number because we are using dont env file
// if we have no port number in env file then we need to specified here by using || and port number  
app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running up on port : ${8000}`);
})