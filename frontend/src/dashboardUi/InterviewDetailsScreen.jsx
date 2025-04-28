import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export function InterviewDetailsScreen({ interview }) {
    // Parse analysis JSON if it exists
    console.log(interview);
    console.log(interview.analysis);
    if (interview.analysis == undefined) interview.analysis = {}
    const analysisData = interview.analysis.metrics || {};
    console.log(analysisData);
    const recommendations = interview.analysis.recommendations;
    const overallScore = interview.analysis.score;
    console.log(overallScore);
    // Data for pie chart (metrics visualization)
    const barData = [
        {
            name: 'Confidence',
            value: analysisData?.confidence?.confidence_score || 0,
        },
        {
            name: 'Clarity',
            value: analysisData?.clarity?.score || 0,
        },
        {
            name: 'Speech Rate',
            value: analysisData?.speech_rate
                ? Math.min(analysisData.speech_rate / 10, 10)
                : 0,
        },
        {
            name: 'Emotion',
            value:
                10 +
                ((analysisData?.emotion?.emotion === 'positive'
                    ? 1
                    : analysisData?.emotion?.emotion === 'negative'
                        ? -1
                        : 0) *
                    10),
        },
    ];


    // Data for bar chart (progress chart showing different metrics)
    const pieData = [
        {
            name: 'Confidence',
            value: analysisData?.confidence?.confidence_score || 0,
            color: '#3498db',
        },
        {
            name: 'Clarity',
            value: analysisData?.clarity?.score || 0,
            color: '#e74c3c',
        },
        {
            name: 'Speech Rate',
            value: analysisData?.speech_rate
                ? Math.min(analysisData.speech_rate / 10, 10)
                : 0,
            color: '#9b59b6',
        },
        {
            name: 'Emotion',
            value:
                10 +
                ((analysisData?.emotion?.emotion === 'positive'
                    ? 1
                    : analysisData?.emotion?.emotion === 'negative'
                        ? -1
                        : 0) *
                    10),
            color: '#2ecc71',
        },
    ];


    const score = analysisData?.score || 0;

    return (
        <div className="bg-indigo-950 min-h-screen p-6 rounded-2xl text-white">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-semibold">{interview?.interview_Type || 'Interview'}</h2>
                <span className="text-md font-medium text-gray-400 mt-2 md:mt-0">
                    Interview ID: <span className="font-bold text-white">#{interview?._id.slice(-4)}</span>
                </span>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Performance Metrics (Pie Chart) */}
                <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col justify-center">
                    <h3 className="text-center text-indigo-950 font-bold text-lg mb-6">Performance Metrics</h3>

                    <div className="flex justify-center items-center w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Interview Feedback (Score + Recommendations) */}
                <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 p-6 rounded-2xl shadow-md flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-6 text-center">Interview Feedback</h3>
                    <div className="bg-white text-indigo-700 rounded-full h-28 w-28 flex items-center justify-center text-3xl font-extrabold shadow-lg mb-6">
                        {overallScore}/100
                    </div>
                    <div className="w-full space-y-2 text-center">
                        {recommendations?.map((rec, index) => (
                            <p key={index} className="text-sm leading-relaxed text-white">• {rec}</p>
                        ))}
                    </div>
                </div>

                {/* Progress Chart (Bar Graph) */}
                <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-center text-indigo-950 font-bold text-lg mb-4">Progress Overview</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#00df9a" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>

    );
}