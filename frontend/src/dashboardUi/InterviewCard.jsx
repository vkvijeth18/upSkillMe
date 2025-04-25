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
            className="bg-indigo-950 text-white p-6 rounded-lg flex flex-col cursor-pointer hover:bg-indigo-900 transition-colors"
        >
            <h2 className="text-xl font-bold mb-2">Interview {interview._id.slice(-4)}</h2>
            <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(interview.status)}`}>
                    {interview.status}
                </span>
                <span className="ml-2 text-sm">{interview.interview_Type || 'Default'}</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">{formatDate(interview.createdAt)}</p>
        </div>
    );
}