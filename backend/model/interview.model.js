// models/interview.model.js
import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  video_url: String,
  interview_id: String,
  interview_Type: String,
  status: {
    type: String,
    enum: ["Processing", "Analyzed", "Failed"],
    default: "Processing",
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed, // <- allows any JSON
    default: {},
  },
  analyzed_at: Date, // <- optional: track when it’s done
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Interview", interviewSchema);
