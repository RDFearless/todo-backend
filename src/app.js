import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express(); // entry point of our backend

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

// config to be used accross whole backend
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cors(corsOptions));
app.use(cookieParser());

// Routers
import userRouter from "./routes/user.route.js"
import collectionRouter from "./routes/collection.route.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/collections", collectionRouter);

export { app }