import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Interview from "../model/interview.model.js";
import { spawn } from "child_process";
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

    const interview = new Interview({
      user_id: userId,
      video_url: videoUrl,
      interview_id: publicId,
      interview_Type: interviewType,
      status: "Processing",
      analysis: {},
    });

    await interview.save();

    const python310Path = "C:\\Program Files\\Python310\\python.exe";
    const python = spawn(python310Path, [
      "./analysis/interview_analysis.py",
      videoUrl,
      interview._id.toString(),
    ]);

    let output = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });

    python.on("close", async (code) => {
      let status = "Failed";
      let parsedData = null; // Initialize parsedData here

      try {
        if (code === 0 && output) {
          const firstBrace = output.indexOf("{");
          const lastBrace = output.lastIndexOf("}");

          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = output.substring(firstBrace, lastBrace + 1).trim();
            try {
              // Parse the JSON output directly here
              const doneIndex = output.indexOf("MoviePy - Done.");

              if (doneIndex !== -1) {
                const jsonPart = output
                  .substring(doneIndex + "MoviePy - Done.".length)
                  .trim();

                try {
                  parsedData = JSON.parse(jsonPart); // Now parsedData is safely defined
                  console.log("Parsed Data:", parsedData);
                } catch (e) {
                  console.log("Error parsing JSON:", e);
                }
              } else {
                console.log("MoviePy not completed.");
              }

              if (parsedData) {
                // Update the interview document in DB only if parsedData exists
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
                console.log("Parsed data is missing.");
              }
            } catch (parseError) {
              console.error("Error parsing JSON:", parseError);
              console.error("Problematic JSON string:", jsonStr);
            }
          } else {
            console.error("No valid JSON found in Python output:", output);
          }
        } else {
          console.error(`Python process exited with code ${code}`);
        }

        // Delete video from Cloudinary if analysis is complete
        try {
          await cloudinary.api.delete_resources([publicId], {
            resource_type: "video",
          });
          console.log(`Video deleted from Cloudinary: ${publicId}`);
        } catch (deleteErr) {
          console.error("Error deleting video from Cloudinary:", deleteErr);
        }

        if (status === "Failed") {
          await Interview.findByIdAndUpdate(interview._id, { status });
        }
      } catch (err) {
        console.error("Unexpected error in Python close handler:", err);
      }
    });

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
