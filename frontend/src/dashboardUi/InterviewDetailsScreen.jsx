import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export function InterviewDetailsScreen({ interview }) {
    // Parse analysis JSON if it exists
    console.log(interview);
    const analysisData = interview.analysis.metrics
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
        <div className="bg-indigo-950 text-white p-6 rounded-lg">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">{interview?.interview_Type || 'Interview'}</h2>
                <h2 className="text-xl font-bold">Interview_{interview?._id.slice(-4)}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-black text-center font-bold mb-2">Performance Metrics</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-indigo-600 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-center mb-4">Your Interview Feedback</h3>
                    <div className="text-center mb-4">
                        <div className="rounded-full bg-white text-indigo-900 h-24 w-24 flex items-center justify-center text-2xl font-bold">
                            {overallScore}/100
                        </div>
                    </div>
                    <div className="space-y-2">
                        {recommendations?.map((recommendation, index) => (
                            <p key={index} className="text-sm">• {recommendation}</p>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg col-span-2">
                    <h3 className="text-black text-center font-bold mb-2">Progress Chart</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={barData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#e67e22" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}