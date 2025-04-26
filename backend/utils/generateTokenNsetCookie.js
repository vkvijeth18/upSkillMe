import jwt from "jsonwebtoken";

const generateTokenAndSetCookies = async (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt_token_UpSkillMe", "", {
    httpOnly: true,
    sameSite: "None", // MUST match
    secure: process.env.NODE_ENV !== "development", // MUST match
    expires: new Date(0), // Expire immediately
    path: "/", // Default, but explicit is better
  });
};
export default generateTokenAndSetCookies;
