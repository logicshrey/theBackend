import mongoose from "mongoose";
import { dbconnect } from "./db/dbconnect.js";
import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config({path:"../.env"})


await dbconnect()
.then((res)=>{
    console.log("MongoDB connection success! ")
    app.listen(process.env.PORT,(req,res)=>{
         console.log(`App is listening on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Connection Error",err)
})
