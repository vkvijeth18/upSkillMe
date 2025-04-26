import express from "express";
import dotenv from "dotenv";
import AuthRoute from "./routes/Auth/auth.route.js";
import MockInterViewRoute from "./routes/MockInterview/mockinterview.route.js";
import connectDB from "./db/connectDB.js";
import cors from "cors";
import multer from "multer";
import ResumeParseRoute from "./routes/fileUpload/fileUpload.route.js";
import GetInterviewDetailsRoute from "./routes/UserProfile/userProfile.route.js";
import { protectRoute } from "./middleware/protectedRoute.js";
import UploadToCloudRoute from "./routes/fileUpload/uploadToCloud.route.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import User from "./model/user.model.js"; // or any model you have

// Keep MongoDB alive every 5 mins
setInterval(async () => {
  try {
    const result = await User.estimatedDocumentCount(); // lightweight ping
    console.log(`MongoDB Keep-Alive: User count = ${result}`);
  } catch (err) {
    console.error("MongoDB Keep-Alive Error:", err.message);
  }
}, 1000 * 60 * 5);

dotenv.config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const corsOptions = {
  origin: ["https://stellar-choux-854087.netlify.app", "http://localhost:5173"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/mockinterview", protectRoute, MockInterViewRoute);
app.use("/api/v1/getinterviews", protectRoute, GetInterviewDetailsRoute);
app.use("/api/v1/resumeupload", protectRoute, ResumeParseRoute);
app.use("/api/v1/uploadtocloud", protectRoute, UploadToCloudRoute);
// Ensure protectRoute is applied
const PORT = process.env.PORT || 5000;
console.log(process.env.PORT);
// Somewhere in your Express setup
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Node backend is alive" });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server Started At http://localhost:${PORT}`);
});
