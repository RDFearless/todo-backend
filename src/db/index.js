import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        
        console.log(`\n DB connected, DB host ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("DB connection failed", error);
        process.exit(1);
    }    
}

export { connectDB }