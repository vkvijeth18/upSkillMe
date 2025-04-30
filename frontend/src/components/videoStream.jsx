import React, { useEffect, useRef } from "react";
import axios from "axios";
import useInterviewStore from "../Store/InterviewStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VideoStream = ({ isInterviewOver }) => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const InterviewType = useInterviewStore((state) => state.interviewType);
    const navigate = useNavigate();

    // Function to upload the recorded video
    const uploadVideo = async () => {
        if (chunksRef.current.length === 0) {
            console.error("No recorded chunks to upload.");
            return;
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });

        // Debug: preview the recorded video before upload
        const previewUrl = URL.createObjectURL(blob);
        window.open(previewUrl);

        chunksRef.current = []; // Clear after creating blob

        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("interviewType", InterviewType);

        try {
            const response = await axios.post(
                "https://upskillme-e2tz.onrender.com/api/v1/uploadtocloud",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                console.log("✅ Video uploaded successfully");
            } else {
                console.error("❌ Error uploading video");
            }
        } catch (error) {
            console.error("❌ Upload failed", error);
        }
    };

    // Function to stop video stream
    const stopVideoStream = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }

        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Function to start video stream
    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            const audioTracks = stream.getAudioTracks();
            console.log("🎤 Audio tracks:", audioTracks);
            if (audioTracks.length === 0) {
                console.warn("⚠️ No audio tracks found in stream");
            }

            // Optional: Audio analysis (debugging only)
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            console.log("🔊 Audio stream connected for debugging");

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                console.log("⏹️ Recording stopped, processing chunks...");
                if (chunksRef.current.length === 0) {
                    console.error("No Recorded Chunks");
                    return;
                }
                await uploadVideo();
                console.log("✅ Video upload complete");
            };

            recorder.onstart = () => console.log("🎥 MediaRecorder started");
            recorder.onpause = () => console.log("⏸️ MediaRecorder paused");
            recorder.onresume = () => console.log("▶️ MediaRecorder resumed");
            recorder.onerror = (e) => console.error("❌ MediaRecorder error:", e);

            recorder.start(1000); // Collect data every second
            console.log("▶️ Recording started");
        } catch (error) {
            console.error("Error accessing media devices:", error);
            toast.error("Failed to access camera and microphone");
        }
    };

    useEffect(() => {
        startVideoStream();
        return () => stopVideoStream();
    }, []);

    useEffect(() => {
        if (isInterviewOver) {
            stopVideoStream();
        }
    }, [isInterviewOver]);

    return (
        <div className="w-full h-full p-4 bg-gray-800 border-4 border-green-500 rounded-lg flex-1">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="mt-4 w-full h-[88%] object-cover rounded"
            />
        </div>
    );
};

export default VideoStream;
