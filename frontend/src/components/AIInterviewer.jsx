import React from "react";
import Scene from "../pages/model";
import VideoStream from "./videoStream";

export default function AIInterviewer({ isSpeaking, phonemes, onRecordingStop }) {
    return (
        <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-400 text-center">
                AI Interviewer
            </h1>
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-blue-400 shadow-lg shadow-blue-500/30 mb-4">
                <Scene phonemes={phonemes} isSpeaking={isSpeaking} />
            </div>
            <div className="w-full max-w-md">
                <VideoStream onRecordingStop={onRecordingStop} />
            </div>
        </div>
    );
}
