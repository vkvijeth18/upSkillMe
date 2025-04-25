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
            const response = await axios.post("http://localhost:3000/api/v1/resumeupload", formData, {
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
        <div className="mt-10 flex flex-col items-center justify-center py-16 px-8 bg-[#0f142f] rounded-xl mx-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                Choose From Below
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {interviewData.map((interview, index) => (
                    <motion.div
                        key={index}
                        className="relative bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center border-2 border-blue-500/50 hover:border-blue-400 transition-all"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {interview.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6">{interview.description}</p>

                        <LazyLoadImage
                            src={interview.image}
                            alt="Interview Illustration"
                            effect="blur"
                            className="w-32 h-32 mb-4"
                        />

                        <button
                            onClick={() => { setSelectedInterview(interview.title); setIsOpen(true) }}
                            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all"
                        >
                            Upload Resume
                        </button>
                    </motion.div>
                ))}
            </div>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h2 className="text-xl font-bold">Upload Your Resume</h2>

                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="mt-4 p-2 border w-full"
                        />

                        <div className="flex justify-end mt-4 gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setInterviewType(selectedInterview); // ✅ Store selected interview type
                                    setIsOpen(true); // ✅ Open the upload modal
                                    handleUpload(); // ✅ Call handleUpload after setting state
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Upload
                            </button>

                        </div>
                    </div>
                </div>
            )
            }
        </div >
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
