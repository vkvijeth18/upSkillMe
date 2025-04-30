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
        chunksRef.current = []; // Clear after creating blob

        const formData = new FormData();
        formData.append("video", blob, "interview.webm"); // ✅ field name must match

        formData.append("interviewType", InterviewType);

        try {
            const response = await axios.post("https://upskillme-e2tz.onrender.com/api/v1/uploadtocloud", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true, // This ensures cookies are sent
            });

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
        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }

        // Stop camera and mic tracks
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
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                console.log("Recording stopped, processing chunks...");

                if (chunksRef.current.length === 0) {  // Fixed typo: lengt → length
                    console.error("No Recorded Chunks");
                    return;
                }
                await uploadVideo();
                console.log("Video upload complete");
            };

            // Start recording
            recorder.start(1000); // Collect data every second
            console.log("Recording started");
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
            stopVideoStream(); // ONLY stop recorder, don't call handleStop manually
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