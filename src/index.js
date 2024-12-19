import { dbconnect } from "./db/dbconnect.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "../.env" });

await dbconnect()
  .then(() => {
    console.log("MongoDB connection success!");
    app.listen(process.env.PORT, (req, res) => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch(()=>{
    console.log("Mongodb connection error!!")
  })
  
