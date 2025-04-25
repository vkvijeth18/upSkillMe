import express from "express";
import { getPhonemes } from "../../controller/mockinterview.controller.js";
import { generateVideo } from "../../controller/mockinterview.controller.js";
const route = express.Router();

route.post("/getPhenomes", getPhonemes);
route.post("/getVideo", generateVideo);

export default route;
