import React, { useEffect, useState } from 'react';
import api from "../pages/utils/api.js";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { DashboardOverviewScreen } from '../dashboardUi/DashBoardOverviewScreen.jsx';
import { DashboardScreen } from '../dashboardUi/DashBoradScreen.jsx';
import { InterviewDetailsScreen } from '../dashboardUi/InterviewDetailsScreen.jsx';
import { ProfileScreen } from '../dashboardUi/ProfileScreen.jsx';
import { Layout } from "../dashboardUi/LayoutComponent.jsx";
function UserDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeInterview, setActiveInterview] = useState(null);

    // Fetch user data
    const {
        data: userData,
        isLoading: userLoading,
    } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const res = await api.get("/api/v1/auth/getMe", {
                withCredentials: true,
            });
            return res.data.data;
        },
    });

    // Fetch interview data
    const {
        data: interviewData,
        isLoading: interviewLoading,
        isError: interviewError,
    } = useQuery({
        queryKey: ['getInterviews'],
        queryFn: async () => {
            const response = await api.get(
                "/getinterviews/getAllInteviews",
                { withCredentials: true }
            );
            if (!response.data.sucess) {
                toast.error("No Interviews Found");
                return [];
            }
            return response.data.interviews;
        },
    });

    // Loading state
    if (userLoading || interviewLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-xl">Loading dashboard...</p>
            </div>
        );
    }

    // Error state
    if (interviewError) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-xl">Error loading interview data. Please try again.</p>
            </div>
        );
    }

    // Render the appropriate screen based on activeTab
    const renderContent = () => {
        switch (activeTab) {
            case 'allInterviews':
            case 'dashboard':
                return (
                    <DashboardScreen
                        interviews={interviewData || []}
                        setActiveInterview={setActiveInterview}
                        setActiveTab={setActiveTab}
                    />
                );
            case 'profile':
                return <ProfileScreen user={userData} />;
            case 'interviewDetails':
                return <InterviewDetailsScreen interview={activeInterview} />;
            case 'techInterviews':
                return (
                    <DashboardScreen
                        interviews={(interviewData || []).filter(i => i.interview_Type === 'Tech Interview')}
                        setActiveInterview={setActiveInterview}
                        setActiveTab={setActiveTab}
                    />
                );
            case 'hrInterviews':
                return (
                    <DashboardScreen
                        interviews={(interviewData || []).filter(i => i.interview_Type === 'HR Interview')}
                        setActiveInterview={setActiveInterview}
                        setActiveTab={setActiveTab}
                    />
                );
            case 'behaviouralInterviews':
                return (
                    <DashboardScreen
                        interviews={(interviewData || []).filter(i => i.interview_Type === 'Behavioural Interview')}
                        setActiveInterview={setActiveInterview}
                        setActiveTab={setActiveTab}
                    />
                );
            case 'overview':
                return <DashboardOverviewScreen interviews={interviewData || []} />;
            default:
                return (
                    <DashboardScreen
                        interviews={interviewData || []}
                        setActiveInterview={setActiveInterview}
                        setActiveTab={setActiveTab}
                    />
                );
        }
    };

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </Layout>
    );
}

export default UserDashboard;
