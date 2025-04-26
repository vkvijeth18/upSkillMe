export function InterviewCard({ interview, onClick }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Analyzed': return 'bg-green-600';
            case 'Failed': return 'bg-red-600';
            default: return 'bg-yellow-600';
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-indigo-950 text-white rounded-2xl p-6 flex flex-col gap-3 cursor-pointer hover:bg-indigo-900 transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px]"
        >
            <div className="flex items-center justify-between ">
                <h2 className="text-lg md:text-xl font-bold truncate">Interview #{interview._id.slice(-4)}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(interview.status)}`}>
                    {interview.status}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm md:text-base opacity-80">{interview.interview_Type || 'Default'}</span>
            </div>

            <p className="text-gray-400 text-xs md:text-sm mt-1">{formatDate(interview.createdAt)}</p>
        </div>

    );
}