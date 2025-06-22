import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})

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