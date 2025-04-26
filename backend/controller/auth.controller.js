import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import generateTokenNsetCookie from "../utils/generateTokenNsetCookie.js";
export const signUp = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword)
      return res
        .status(401)
        .json({ success: false, error: "All Field Required" });

    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Password Didnt Match" });
    }
    const isUserExists = await User.findOne({ username: username.trim() });
    if (isUserExists)
      return res.status(401).json({
        success: false,
        error: "UserName already Exists Please Login",
      });
    const isEmailExists = await User.findOne({ email: email.trim() });
    if (isEmailExists) {
      return res
        .status(401)
        .json({ success: false, error: "Email already exists" });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
      return res
        .status(401)
        .json({ success: false, error: "Please Provide Valid Email" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(401).json({
        success: false,
        error:
          "Password must be at least 8 characters long and include at least one letter and one number",
      });
    }
    const salt = await bcrypt.genSalt(10);

    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: hashedPass,
    });
    await newUser.save();
    generateTokenNsetCookie(newUser._id, res);
    const savedUser = await User.findById(newUser._id).select("-password");
    res.status(200).json({ success: true, data: savedUser });
  } catch (error) {
    console.log("Error in SignUp", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(401)
        .json({ success: false, error: "All Field Required" });
    const user = await User.findOne({ username: username.trim() });
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "User Not Found Please SignUp First" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, error: "Password Didn't Match" });
    generateTokenNsetCookie(user._id, res);
    user.password = null;
    return res.status(200).json({ data: user });
  } catch (error) {
    console.log("Error in LogIn", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res.status(401).json({ sucess: false, error: "User Not Found" });
    return res.status(200).json({ sucess: true, data: user });
  } catch (error) {
    console.log("Error in getMe", error.message);
    res.status(500).json({ sucess: false, error: "Internal Server Error" });
  }
};
export const logOut = async (req, res) => {
  try {
    // Use clearCookie instead of setting an empty cookie
    res.cookie("jwt_token_UpSkillMe", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0), // Expire immediately
      path: "/",
    });

    res.clearCookie("jwt_token_UpSkillMe", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      path: "/",
    });

    return res.status(200).json({ success: true, data: "User Logged Out" });
  } catch (error) {
    console.log("Error in LogOut", error.message);
    res.status(500).json({ success: false, error: "Internal Server error" });
  }
};
