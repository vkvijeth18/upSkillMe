import express from "express";
import multer from "multer";
import { uploadToCloud } from "../../controller/uploadToCloud.controller.js";
const route = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

route.post("/", upload.single("video"), uploadToCloud);

export default route;
