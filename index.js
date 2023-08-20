const express=require("express");
const app=express();
const connection=require("./config/dbConnection");
const dotenv=require("dotenv");
const authRoute=require('./routes/auth');
const userRoute=require('./routes/user');
// const productRoute=require('./routes/products');
// const cartRoute=require('./routes/cart');
// const orderRoute=require('./routes/order');
dotenv.config();




// we are using express.json() for taking input as json object
app.use(express.json());


app.use("/api/auth",authRoute)
app.use("/api/user",userRoute);
// app.use("/api/products",productRoute);
// app.use("/api/cart",cartRoute);
// app.use("/api/order",orderRoute);



app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running up on port : ${8000}`);
})