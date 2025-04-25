import fs from "fs";
import { promisify } from "util";
import { fal } from "@fal-ai/client";
import { dictionary } from "cmu-pronouncing-dictionary";
const unlinkAsync = promisify(fs.unlink);

// ✅ Function to Convert Text to Phonemes
export const getPhonemes = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required!" });

    // Convert text to phonemes
    const cleanedText = text.replace(/[^a-zA-Z\s]/g, "").toLowerCase();
    const phonemes = cleanedText
      .split(" ")
      .map((word) => dictionary[word] || "???") // Replace with phoneme dictionary
      .join(" ");

    return res.json({ text, phonemes });
  } catch (error) {
    console.error("Error in getPhonemes:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Generate AI Interview Video
export const generateVideo = async (req, res) => {
  try {
    fal.config({
      credentials: process.env.FALAI_API_KEY,
    });
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text and image URL are required" });
    }
    const imageUrl =
      "https://res.cloudinary.com/dipzknyve/image/upload/v1740290453/final_interviewer_qlgrmi.png";

    // ✅ 1. Generate TTS Audio from Text
    const ttsResult = await fal.subscribe("fal-ai/kokoro/american-english", {
      input: {
        prompt: text,
        voice: "af_heart", // Change this if you want a different voice
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    if (!ttsResult.data || !ttsResult.data.audio.url) {
      return res.status(500).json({ error: "Failed to generate TTS audio" });
    }

    const audioUrl = ttsResult.data.audio.url;

    // ✅ 2. Generate AI Video with Lip Sync

    const videoResult = await fal.subscribe("fal-ai/sadtalker", {
      input: {
        source_image_url: imageUrl,
        driven_audio_url: audioUrl,
        face_model_resolution: "512",
        expression_scale: 1,
        face_enhancer: null,
        preprocess: "full",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    console.log(videoResult);
    if (!videoResult.data || !videoResult.data.video.url) {
      return res.status(500).json({ error: "Failed to generate video" });
    }

    const videoUrl = videoResult.data.video.url;
    console.log(videoUrl);
    return res.status(200).json({ videoUrl });
  } catch (error) {
    console.error(
      "Error in generating video:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
