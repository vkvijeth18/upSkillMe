
import axios from 'axios';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { NavItem } from "./NavItem.jsx";
import { Link } from 'react-router-dom';
import { Home, ClipboardList, Code, User, Users, UserCircle, Menu } from 'lucide-react';
export function Layout({ children, activeTab, setActiveTab }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    return (
        <div className="flex h-screen text-white font-bold text-base">
            {/* Sidebar (Desktop) */}
            <div className="hidden md:flex w-64 h-full bg-[#1C1733] p-6 flex-col gap-4 border-r border-[#1a1d1c]">
                <Link to={'/'} className="text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df] mb-3">
                    UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span>
                </Link>

                <NavItem icon={<Home size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavItem icon={<ClipboardList size={20} />} label="All Interviews" active={activeTab === 'allInterviews'} onClick={() => setActiveTab('allInterviews')} />
                <NavItem icon={<Code size={20} />} label="Tech Interviews" active={activeTab === 'techInterviews'} onClick={() => setActiveTab('techInterviews')} />
                <NavItem icon={<User size={20} />} label="HR Interviews" active={activeTab === 'hrInterviews'} onClick={() => setActiveTab('hrInterviews')} />
                <NavItem icon={<Users size={20} />} label="Behavioral Interviews" active={activeTab === 'behaviouralInterviews'} onClick={() => setActiveTab('behaviouralInterviews')} />
                <NavItem icon={<UserCircle size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </div>

            {/* Drawer for Mobile */}
            <div className={`fixed top-0 left-0 w-64 h-full bg-[#1C1733] p-6 flex-col gap-3 border-r border-[#1a1d1c] z-50 transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden`}>
                <button className="text-gray-400 mb-4" onClick={() => setDrawerOpen(false)}>Close ✕</button>
                <div className="flex items-center">
                    <Link to={'/'} className="mt-3 text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df] mb-3 pb-3">
                        UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span>
                    </Link>
                </div>
                <NavItem icon={<Home size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setDrawerOpen(false); }} />
                <NavItem icon={<ClipboardList size={20} />} label="All Interviews" active={activeTab === 'allInterviews'} onClick={() => { setActiveTab('allInterviews'); setDrawerOpen(false); }} />
                <NavItem icon={<Code size={20} />} label="Tech Interviews" active={activeTab === 'techInterviews'} onClick={() => { setActiveTab('techInterviews'); setDrawerOpen(false); }} />
                <NavItem icon={<User size={20} />} label="HR Interviews" active={activeTab === 'hrInterviews'} onClick={() => { setActiveTab('hrInterviews'); setDrawerOpen(false); }} />
                <NavItem icon={<Users size={20} />} label="Behavioral Interviews" active={activeTab === 'behaviouralInterviews'} onClick={() => { setActiveTab('behaviouralInterviews'); setDrawerOpen(false); }} />
                <NavItem icon={<UserCircle size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setDrawerOpen(false); }} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation Bar */}
                <div className="flex items-center p-4 bg-[#1C1733] border-b border-[#1a1d1c] md:hidden">
                    <button onClick={() => setDrawerOpen(true)}>
                        <Menu size={28} className="text-white" />
                    </button>
                    <Link to={'/'} className="ml-3 mt-2 text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df] mb-2">
                        UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span>
                    </Link>
                </div>

                {/* Content area */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}