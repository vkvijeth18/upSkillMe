import express from "express";
import {
  logIn,
  signUp,
  getMe,
  logOut,
} from "../../controller/auth.controller.js";
import { protectRoute } from "../../middleware/protectedRoute.js";
const route = express.Router();

route.post("/signup", signUp);
route.post("/login", logIn);
route.post("/logout", logOut);
route.get("/getme", protectRoute, getMe);

export default route;
