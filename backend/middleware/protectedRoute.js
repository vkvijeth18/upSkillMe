import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_token_UpSkillMe;
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: No Token Provided",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Not A Valid Token",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        error: "User Not Found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute midddleware", error.message);
    return res.status(500).json({
      error: "Internal Server error",
    });
  }
};
