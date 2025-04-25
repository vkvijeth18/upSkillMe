import React from "react";

export default function DebugInfo({ debug }) {
    return (
        <div className="p-3 bg-gray-800 rounded-lg text-xs max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-1">Debug Info:</h3>
            <pre className="whitespace-pre-wrap">
                {JSON.stringify(debug, null, 2)}
            </pre>
        </div>
    );
}
