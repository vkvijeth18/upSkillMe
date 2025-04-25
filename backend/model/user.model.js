import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String, // will store a URL
    default: "https://yourdomain.com/default-profile.jpg", // optional default
  },
});

const User = mongoose.model("user", userSchema);
export default User;
