import express from "express";
import dotenv from "dotenv"
import helmet from "helmet";
import connectDB from "./db/connectDb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"


dotenv.config()

connectDB()

const app = express();

const PORT = process.env.PORT || 5001

app.use(express.json()); /// to parse json data in req body
app.use(express.urlencoded({extended:true})); // to parse from data into req body
app.use(cookieParser());
//app.use(helmet({ hsts: false }));

//Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes)

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}bhadwe`));