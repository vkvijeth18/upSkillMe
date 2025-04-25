import React, { useState, useEffect } from 'react';
export function DashboardOverviewScreen({ interviews }) {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate metrics across all analyzed interviews
    const analyzedInterviews = interviews.filter(i => i.status === 'Analyzed');

    const calculateAverageScore = () => {
        if (analyzedInterviews.length === 0) return 0;

        let totalScore = 0;
        let count = 0;

        analyzedInterviews.forEach(interview => {
            if (interview.analysis) {
                try {
                    const analysis = JSON.parse(interview.analysis);
                    totalScore += parseInt(analysis.score) || 0;
                    count++;
                } catch (e) {
                    // Skip if parsing fails
                }
            }
        });

        return count ? Math.round(totalScore / count) : 0;
    };

    const calculateAverageConfidence = () => {
        if (analyzedInterviews.length === 0) return 0;

        let totalConfidence = 0;
        let count = 0;

        analyzedInterviews.forEach(interview => {
            if (interview.analysis) {
                try {
                    const analysis = JSON.parse(interview.analysis);
                    const metrics = analysis.metrics || {};
                    if (metrics.confidence && metrics.confidence.confidence_score) {
                        totalConfidence += metrics.confidence.confidence_score;
                        count++;
                    }
                } catch (e) {
                    // Skip if parsing fails
                }
            }
        });

        return count ? (totalConfidence / count).toFixed(1) : 0;
    };

    const calculateAttitude = () => {
        if (analyzedInterviews.length === 0) return 0;

        let totalAttitude = 0;
        let count = 0;

        analyzedInterviews.forEach(interview => {
            if (interview.analysis) {
                try {
                    const analysis = JSON.parse(interview.analysis);
                    const metrics = analysis.metrics || {};
                    if (metrics.emotion && metrics.emotion.polarity !== undefined) {
                        // Convert polarity (-1 to 1) to a 0-10 scale
                        const attitude = (metrics.emotion.polarity + 1) * 5;
                        totalAttitude += attitude;
                        count++;
                    }
                } catch (e) {
                    // Skip if parsing fails
                }
            }
        });

        return count ? (totalAttitude / count).toFixed(1) : 0;
    };

    const recentInterviews = [...interviews]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    return (
        <div className="p-6 rounded-lg"> {/*here*/}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-indigo-600 p-6 rounded-lg flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold text-white mb-2">Overall Score</h2>
                    <div className="bg-white text-indigo-900 rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold">
                        {calculateAverageScore()}
                    </div>
                </div>
                <div className="bg-indigo-600 p-6 rounded-lg flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold text-white mb-2">Confidence</h2>
                    <div className="bg-white text-indigo-900 rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold">
                        {calculateAverageConfidence()}
                    </div>
                </div>
                <div className="bg-indigo-600 p-6 rounded-lg flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold text-white mb-2">Attitude</h2>
                    <div className="bg-white text-indigo-900 rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold">
                        {calculateAttitude()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-950 p-4 rounded-lg text-white">
                    <h2 className="text-lg font-bold mb-4">Recent Interview Info</h2>
                    {recentInterviews.length > 0 ? (
                        <div className="space-y-3">
                            {recentInterviews.map(interview => (
                                <div key={interview._id} className="bg-indigo-900 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <span>{interview.interview_Type || 'Interview'}</span>
                                        <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-1">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${interview.status === 'Analyzed' ? 'bg-green-600' : 'bg-red-600'
                                            }`}>
                                            {interview.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No recent interviews</p>
                    )}
                </div>
                <div className="bg-indigo-950 p-4 rounded-lg text-white">
                    <h2 className="text-lg font-bold mb-4">Interview Info</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Total Interviews:</span>
                            <span>{interviews.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Analyzed:</span>
                            <span>{interviews.filter(i => i.status === 'Analyzed').length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Failed:</span>
                            <span>{interviews.filter(i => i.status === 'Failed').length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>HR Interviews:</span>
                            <span>{interviews.filter(i => i.interview_Type === 'HR Interview').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-950 text-white p-4 rounded-lg flex justify-center space-x-2">
                <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-indigo-600' : ''}`}
                >
                    1
                </button>
                <button
                    onClick={() => setCurrentPage(2)}
                    className={`px-4 py-2 rounded ${currentPage === 2 ? 'bg-indigo-600' : ''}`}
                >
                    2
                </button>
            </div>
        </div>
    );
}
