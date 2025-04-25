import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import useInterviewStore from "../Store/InterviewStore";
const VideoStream = ({ onRecordingStop }) => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const InterviewType = useInterviewStore((state) => state.interviewType);
    useEffect(() => {
        startVideoStream();
        return () => stopVideoStream();
    }, []);

    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = handleStop;

            mediaRecorderRef.current = recorder;
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    };

    const stopVideoStream = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const startRecording = () => {
        if (mediaRecorderRef.current) {
            chunksRef.current = []; // Clear previous recordings
            mediaRecorderRef.current.start();
            //console.log("Recording started");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            //console.log("Recording stopped");
        }
    };

    const handleStop = async () => {
        if (chunksRef.current.length === 0) {
            console.error("No recorded data available.");
            return;
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = []; // Clear after processing

        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("interviewType", InterviewType);
        //console.log("Inteview Type:", InterviewType);
        try {
            //console.log("Video Stream uploading");
            const response = await axios.post("https://upskillme-e2tz.onrender.com/api/v1/uploadtocloud", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (response.status === 200) {
                //console.log("Video uploaded successfully", response.data);
            } else {
                console.error("Error uploading video");
            }
        } catch (error) {
            console.error("Error uploading video", error);
        }

        if (onRecordingStop) {
            onRecordingStop();
        }
    };

    return (
        <div className="mt-5 p-4 bg-gray-800 border-4 border-green-500 rounded-lg flex-1">
            <h2 className="text-lg font-semibold text-green-400 mb-2">Live Video Feed:</h2>
            <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-[250px] object-cover rounded"
            />
            <div className="flex justify-between mt-2">
                <button
                    onClick={startRecording}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Start Recording
                </button>
                <button
                    onClick={stopRecording}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Stop Recording
                </button>
            </div>
        </div>
    );
};

export default VideoStream;
