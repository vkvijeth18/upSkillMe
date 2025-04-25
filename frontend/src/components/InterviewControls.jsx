import React from "react";

export default function InterviewControls({
    question,
    currentResponse,
    setCurrentResponse,
    moveToNextQuestion,
    endInterview,
    isSpeaking,
    isListeningActive,
}) {
    return (
        <div className="flex flex-col space-y-4 h-full">
            {question && (
                <div className="p-4 bg-gray-800 border-l-4 border-blue-500 rounded-lg">
                    <h2 className="text-lg font-semibold text-blue-400 mb-2">Question:</h2>
                    <p className="text-lg">{question}</p>
                </div>
            )}
            <div className="p-4 bg-gray-800 border-l-4 border-purple-500 rounded-lg flex-1 overflow-auto">
                <h2 className="text-lg font-semibold text-purple-400 mb-2">Your Response:</h2>
                <div className="min-h-32 p-3 bg-gray-700 rounded text-lg max-h-64 overflow-y-auto">
                    {currentResponse || "Your answer will appear here..."}
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                    onClick={moveToNextQuestion}
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center"
                    disabled={isSpeaking}
                >
                    ⏭️ Skip
                </button>
                <button
                    onClick={endInterview}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center sm:col-span-1 col-span-2"
                >
                    ❌ End Interview
                </button>
            </div>
        </div>
    );
}
