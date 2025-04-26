import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import useResumeStore from "../Store/ResumeStore";
import useInterviewStore from "../Store/InterviewStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast"

export default function InterviewSelection() {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedInterview, setSelectedInterview] = useState(null);

    const setResumeText = useResumeStore((state) => state.setResumeText);
    const setInterviewType = useInterviewStore((state) => state.setInterviewType);
    const [uploadStatus, setUploadStatus] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("please select a file to upload");
            return;
        }

        toast.success("Uploading file...");
        setIsOpen(false);
        setFile(null);

        const formData = new FormData();
        formData.append("resume", file);
        try {
            const response = await axios.post("https://upskillme-e2tz.onrender.com/api/v1/resumeupload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (response.data.success) {
                // Store extracted text
                setResumeText(response.data.text); // Store extracted text
                setUploadStatus(`File uploaded: ${response.data.fileName}`);

                // Redirect to interview page after successful upload
                setTimeout(() => {
                    navigate("/takeinterview");
                }, 500);
            } else {
                setUploadStatus("Upload failed: " + response.data.error);
            }
        } catch (err) {
            toast.error("Error Uploading file");
            console.error("Upload error:", err);
            setUploadStatus("Error uploading file.");
        }
    };

    return (
        <div className="mt-10 flex flex-col items-center justify-center py-16 px-6 md:px-10 bg-gradient-to-b from-[#0f142f] to-[#1a1f3c] rounded-2xl mx-4 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-12">
                Choose Your Interview Type
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
                {interviewData.map((interview, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="relative bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border-2 border-blue-400 hover:border-blue-500 transition-all"
                    >
                        <LazyLoadImage
                            src={interview.image}
                            alt="Interview Illustration"
                            effect="blur"
                            className="w-28 h-28 mb-6 object-contain"
                        />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {interview.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">{interview.description}</p>

                        <button
                            onClick={() => {
                                setSelectedInterview(interview.title);
                                setIsOpen(true);
                            }}
                            className="mt-auto px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-full transition-all"
                        >
                            Upload Resume
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-2xl p-8 w-[90%] max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold text-center mb-6">
                            Upload Your Resume
                        </h2>

                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="w-full border-2 border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:border-blue-500"
                        />

                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setInterviewType(selectedInterview);
                                    handleUpload();
                                }}
                                className="px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const interviewData = [
    {
        title: "Behavioral Interview",
        description:
            "Assess problem-solving, teamwork, and leadership skills using real-life examples.",
        image: "/behavioral.png",
    },
    {
        title: "Technical Interview",
        description:
            "Evaluate coding skills, problem-solving abilities, and logical reasoning.",
        image: "/technical.png",
    },
    {
        title: "HR Interview",
        description:
            "Focus on communication skills, cultural fit, and alignment with company values.",
        image: "/Hr.png",
    },
];
