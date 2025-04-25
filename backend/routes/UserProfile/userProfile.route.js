import { getAllInterviews } from "../../controller/userProfile.controller.js";
import express from "express";
import { updateUserProfile } from "../../controller/userProfile.controller.js";
import multer from "multer";
const route = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
route.get("/getAllInteviews", getAllInterviews);
route.post(
  "/updateUserProfile",
  upload.single("profileImage"),
  updateUserProfile
);
export default route;
