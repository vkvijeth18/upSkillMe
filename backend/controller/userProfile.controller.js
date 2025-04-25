import Interview from "../model/interview.model.js";
import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user_id: req.user._id }).sort({
      createdAt: -1,
    });
    if (!interviews) {
      return res
        .status(404)
        .json({ sucess: false, error: "No Interviews Found" });
    }
    return res.status(200).json({ sucess: true, interviews });
  } catch (err) {
    console.error("Error fetching interviews:", err);
    return res
      .status(500)
      .json({ sucess: false, error: "Internal Server Error" });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const { username, email, oldpass, newpass } = req.body;

    if (!username || !email) {
      return res
        .status(400)
        .json({ success: false, error: "Username and email are required" });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found, please sign up first",
      });
    }

    const updateData = {
      email: email.trim(),
    };

    // If user wants to update the password
    if (oldpass && newpass) {
      const isMatch = await bcrypt.compare(oldpass, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, error: "Old password didn't match" });
      }

      const hashedPass = await bcrypt.hash(newpass, 10);
      updateData.password = hashedPass;
    }

    // Handle Cloudinary image upload if profile image is provided
    if (req.file) {
      const stream = streamifier.createReadStream(req.file.buffer);

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "user_profiles",
            format: "jpg", // or adjust based on frontend file type
          },
          (error, uploadedFile) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(error);
            }
            resolve({
              secure_url: uploadedFile.secure_url,
              public_id: uploadedFile.public_id,
            });
          }
        );
        stream.pipe(uploadStream);
      });

      const { secure_url: profileImageUrl, public_id: imagePublicId } =
        await uploadPromise;

      // Save image URL in DB
      updateData.profileImage = profileImageUrl;
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: username.trim() },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, error: "User update failed" });
    }

    // Remove password from response
    const { password, ...userWithoutPass } = updatedUser._doc;

    return res.status(200).json({ success: true, data: userWithoutPass });
  } catch (err) {
    console.error("Error updating user profile:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};
