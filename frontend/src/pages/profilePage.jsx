import React from "react";
import { FaMicrophone, FaStar, FaChartLine } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { MdEdit } from "react-icons/md";

const InterviewDashboard = () => {
    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#0e0c1b] text-white m-6 ">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 bg-[#0e0c1b] p-6 flex flex-col gap-6 rounded-3xl border border-white outline outline-1 outline-white">

                <div className="flex items-center gap-3 text-lg font-semibold">
                    <FaMicrophone /> INTERVIEWS
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                    <FaStar /> FEEDBACKS
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                    <FaChartLine /> ANALYSIS
                </div>
                <div className="mt-auto flex items-center gap-3 text-lg font-semibold text-red-500">
                    <IoIosLogOut /> LOGOUT
                </div>
            </div>

            <div className="flex-1 p-10">
                {/* Profile Section */}
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gray-500 rounded-full"></div>
                    <div className="flex-1">
                        <div className="w-3/4 h-4 bg-green-500 rounded-lg mb-2"></div>
                        <div className="w-1/2 h-4 bg-green-500 rounded-lg mb-2"></div>
                        <div className="w-full h-4 bg-green-500 rounded-lg"></div>
                    </div>
                    <div className="bg-red-500 p-3 rounded-full cursor-pointer">
                        <MdEdit className="text-xl" />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white pb-2 mb-4">
                    <div className="mr-6 pb-1 border-b-2 border-white cursor-pointer">ALL INTERVIEWS</div>
                    <div className="mr-6 cursor-pointer">TECH INTERVIEWS</div>
                    <div className="cursor-pointer">HR INTERVIEWS</div>
                </div>

                {/* Interview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full h-32 bg-gray-800 rounded-lg"></div>
                    <div className="w-full h-32 bg-gray-800 rounded-lg"></div>
                    <div className="w-full h-32 bg-gray-800 rounded-lg"></div>
                    <div className="w-full h-32 bg-gray-800 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default InterviewDashboard;
