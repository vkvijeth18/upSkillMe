import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Interview from "../model/interview.model.js";
import axios from "axios";
import cloudinary from "cloudinary";

export const uploadToCloud = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No File Found" });
    }

    if (!req.user || !req.user._id) {
      console.error("Unauthorized access: User not authenticated");
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const userId = req.user._id;
    const stream = streamifier.createReadStream(req.file.buffer);
    const interviewType = req.body.interviewType || "default";

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "interview_videos",
          format: "webm",
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

    const { secure_url: videoUrl, public_id: publicId } = await uploadPromise;

    // Save interview to DB
    const interview = new Interview({
      user_id: userId,
      video_url: videoUrl,
      interview_id: publicId,
      interview_Type: interviewType,
      status: "Processing",
      analysis: {},
    });

    await interview.save();

    // Call Flask API on Render
    let status = "Failed";
    let parsedData = null;

    try {
      const response = await axios.post(
        "https://upskilme-analysis.onrender.com",
        {
          videoUrl,
          interviewId: interview._id.toString(),
        }
      );

      parsedData = response.data;

      if (parsedData && !parsedData.error) {
        const updated = await Interview.findByIdAndUpdate(
          interview._id,
          {
            status: "Analyzed",
            analysis: parsedData,
            analyzed_at: new Date(),
          },
          { new: true }
        );

        if (!updated) {
          console.error("Failed to update interview in DB");
        } else {
          console.log("Updated interview in DB:", updated._id);
        }

        status = "Analyzed";
        console.log("Interview analysis updated successfully.");
      } else {
        console.error(
          "Analysis error from Python API:",
          parsedData?.error || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Failed to call Python analysis API:", err.message);
    }

    // Delete video from Cloudinary
    try {
      await cloudinary.api.delete_resources([publicId], {
        resource_type: "video",
      });
      console.log(`Video deleted from Cloudinary: ${publicId}`);
    } catch (deleteErr) {
      console.error("Error deleting video from Cloudinary:", deleteErr);
    }

    // Final fallback if analysis failed
    if (status === "Failed") {
      await Interview.findByIdAndUpdate(interview._id, { status });
    }

    return res.json({
      success: true,
      videoUrl,
      interviewId: interview._id,
      message: "Interview is being processed.",
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ success: false, error: "Upload failed" });
  }
};
