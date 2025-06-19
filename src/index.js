import { connectDB } from "./db/index.js";
import express from "express"
import dotenv from "dotenv"

dotenv.config({
    path: "./env"
})

const app = express();
const port = process.env.PORT

connectDB()

.then(() => {
    app.on("error", (error) => {
        console.log("Connected to DB but failed to connect to server", error);
        throw error;
    })
    
    app.listen(port, () => {
        console.log("Server is listening on port ", port);
    })
})

.catch((error) => {
    console.log("DB connection failed", error);
})