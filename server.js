import express from "express";
import dotenv from "dotenv"
import helmet from "helmet";
import connectDB from "./db/connectDb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import cors from "cors";
import {v2 as cloudinary} from "cloudinary"


dotenv.config()

connectDB()

const app = express();

const PORT = process.env.PORT || 5001

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

app.use(express.json({limit:"500mb"})); /// to parse json data in req body
app.use(express.urlencoded({extended:true})); // to parse from data into req body
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true // Include credentials if needed (e.g., cookies)
}));
//app.use(helmet({ hsts: false }));

//Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}bhadwe`));