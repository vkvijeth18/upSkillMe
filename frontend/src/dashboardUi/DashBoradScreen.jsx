import React, { useState, useEffect } from 'react';
import { InterviewCard } from './InterviewCard.jsx';
export function DashboardScreen({ interviews, setActiveInterview, setActiveTab }) {
    const [currentPage, setCurrentPage] = useState(1);
    const interviewsPerPage = 4;

    // Calculate pagination
    const indexOfLastInterview = currentPage * interviewsPerPage;
    const indexOfFirstInterview = indexOfLastInterview - interviewsPerPage;
    const currentInterviews = interviews.slice(indexOfFirstInterview, indexOfLastInterview);
    const totalPages = Math.ceil(interviews.length / interviewsPerPage);

    const handleInterviewClick = (interview) => {
        setActiveInterview(interview);
        setActiveTab('interviewDetails');
    };

    return (
        <div className="flex flex-col p-6 rounded-lg"> {/*Here*/}
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-col-1 gap-4">
                {currentInterviews.length === 0 ? (
                    <div className="col-span-2  text-center text-zinc-50 text-2xl font-bold">
                        No Interviews Found
                    </div>
                ) : (
                    currentInterviews.map(interview => (
                        <InterviewCard
                            key={interview._id}
                            interview={interview}
                            onClick={() => handleInterviewClick(interview)}
                        />
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-6 bg-indigo-950 text-white p-4 rounded-lg flex justify-center space-x-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-indigo-600' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}