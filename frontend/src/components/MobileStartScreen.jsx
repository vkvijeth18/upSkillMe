// components/MobileStartScreen.jsx
import React from 'react';

export default function MobileStartScreen({ onStart }) {


    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center text-center p-6">
            <div className="bg-gray-800 text-white p-8 rounded-lg space-y-4 max-w-md mx-auto">
                <h2 className="text-2xl font-bold">Welcome to your interview!</h2>
                <p>
                    Tap the button below to begin. This allows us to access your microphone and start the conversation with Camalia.
                </p>
                <button
                    onClick={onStart}
                    className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded text-lg font-semibold"
                >
                    Start Interview
                </button>
            </div>
        </div>
    );
}
