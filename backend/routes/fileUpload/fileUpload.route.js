import express from "express";
import multer from "multer";
import uploadResume from "../../controller/uploadresume.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

const route = express.Router();
route.post("/", upload.single("resume"), uploadResume);

export default route;
