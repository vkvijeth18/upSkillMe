import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import useInterviewStore from "../Store/InterviewStore";
import { useNavigate } from "react-router-dom";

const VideoStream = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const InterviewType = useInterviewStore((state) => state.interviewType);
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        startVideoStream();

        return () => {
            stopRecordingProperly();
            stopVideoStream();
        };
    }, []);

    const startVideoStream = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(userStream);

            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }

            const recorder = new MediaRecorder(userStream);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                console.log("Recorder fully stopped. Preparing upload...");
                uploadVideo();
            };

            mediaRecorderRef.current = recorder;

            // Start recording after setup
            startRecording();
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    };

    const startRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "recording") {
            chunksRef.current = []; // Reset chunks
            mediaRecorderRef.current.start(1000); // record in 1s chunks (optional)
            setIsRecording(true);
            console.log("Recording started...");
        }
    };

    const stopRecordingProperly = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            console.log("Stopping recording...");
        }
    };

    const uploadVideo = async () => {
        if (chunksRef.current.length === 0) {
            console.error("No recorded chunks to upload.");
            return;
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = []; // Clear after creating blob

        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("interviewType", InterviewType);

        try {
            const response = await axios.post("https://upskillme-e2tz.onrender.com/api/v1/uploadtocloud", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true, // ✅ This ensures cookies are sent
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

    const stopVideoStream = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    return (
        <div className="w-full h-full p-4 bg-gray-800 border-4 border-green-500 rounded-lg flex-1 relative">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="mt-4 w-full h-[88%] object-cover rounded"
            />
            {isRecording && (
                <div className="absolute top-2 right-2 flex items-center space-x-2 bg-red-600 bg-opacity-70 px-2 py-1 rounded text-xs text-white">
                    <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span>REC</span>
                </div>
            )}
        </div>
    );
};

export default VideoStream;
