import React from "react";

export default function StatusBar({ timer, isListeningActive, isSpeaking }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <p className="font-medium">
                Time: {Math.floor(timer / 60)}:{("0" + Math.floor(timer % 60)).slice(-2)}
            </p>
            <div className="flex items-center space-x-3">
                <div className="flex items-center">
                    <div
                        className={`w-3 h-3 rounded-full mr-2 ${isListeningActive ? "bg-green-500 animate-pulse" : "bg-red-500"
                            }`}
                    ></div>
                    <span className="text-sm">{isListeningActive ? "Listening" : "Muted"}</span>
                </div>
                <div className="flex items-center">
                    <div
                        className={`w-3 h-3 rounded-full mr-2 ${isSpeaking ? "bg-blue-500 animate-pulse" : "bg-gray-500"
                            }`}
                    ></div>
                    <span className="text-sm">{isSpeaking ? "Speaking" : "Silent"}</span>
                </div>
            </div>
        </div>
    );
}
