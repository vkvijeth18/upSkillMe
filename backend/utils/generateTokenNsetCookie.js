import jwt from "jsonwebtoken";

const generateTokenAndSetCookies = async (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt_token_UpSkillMe", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "None",
    secure: process.env.NODE_ENV !== "development",
  });
};
export default generateTokenAndSetCookies;
