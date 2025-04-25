
import axios from 'axios';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { NavItem } from "./NavItem.jsx";
export function Layout({ children, activeTab, setActiveTab }) {
    return (
        <div className="flex h-screen  text-white font-mono text-base">
            {/* Sidebar */}
            <div className="w-64 bg-[#1C1733]  p-4 flex flex-col m-4 rounded-lg ">
                <h2 className="text-xl font-bold mb-6">Dash Board</h2>
                <nav className="flex flex-col space-y-2">
                    <NavItem label="ALL InterViews" active={activeTab === 'allInterviews'} onClick={() => setActiveTab('allInterviews')} />
                    <NavItem label="Tech Interviews" active={activeTab === 'techInterviews'} onClick={() => setActiveTab('techInterviews')} />
                    <NavItem label="HR Interviews" active={activeTab === 'hrInterviews'} onClick={() => setActiveTab('hrInterviews')} />
                    <NavItem label="Behavioural Interviews" active={activeTab === 'behaviouralInterviews'} onClick={() => setActiveTab('behaviouralInterviews')} />
                    <NavItem label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />



                </nav>
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