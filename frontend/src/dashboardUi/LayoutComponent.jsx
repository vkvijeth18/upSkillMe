
import axios from 'axios';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { NavItem } from "./NavItem.jsx";
import { Link } from 'react-router-dom';
import { Home, ClipboardList, Code, User, Users, UserCircle } from 'lucide-react';
export function Layout({ children, activeTab, setActiveTab }) {
    return (
        <div className="flex h-screen  text-white font-bold text-base">
            {/* Sidebar */}
            <div className="w-64 h-full  bg-[#1C1733] p-6 flex flex-col gap-4 border-r border-[#1a1d1c]">
                <Link to={'/'} className="text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df] mb-3">
                    UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span> </Link>


                <NavItem icon={<Home size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavItem icon={<ClipboardList size={20} />} label="All Interviews" active={activeTab === 'allInterviews'} onClick={() => setActiveTab('allInterviews')} />
                <NavItem icon={<Code size={20} />} label="Tech Interviews" active={activeTab === 'techInterviews'} onClick={() => setActiveTab('techInterviews')} />
                <NavItem icon={<User size={20} />} label="HR Interviews" active={activeTab === 'hrInterviews'} onClick={() => setActiveTab('hrInterviews')} />
                <NavItem icon={<Users size={20} />} label="Behavioral Interviews" active={activeTab === 'behaviouralInterviews'} onClick={() => setActiveTab('behaviouralInterviews')} />
                <NavItem icon={<UserCircle size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </div>


            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation Bar */}

                {/* Content area */}
                <div className="flex-1 p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}