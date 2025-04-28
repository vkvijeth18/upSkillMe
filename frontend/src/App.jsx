import './App.css';
import HomePage from './Home/HomePage.jsx';
import NavBar from '../src/common/navBar.jsx';
import InterviewSelection from './pages/InterviewSelection.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import ProfilePage from "./pages/userDashboard.jsx";
import AuthPage from './Auth/AuthPage.jsx';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import InfinitySpinner from '../loaders/InfinitySpinner.jsx';

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await axios.get("https://upskillme-e2tz.onrender.com/api/v1/auth/getme", {
          withCredentials: true
        });
        if (response.data.sucess) {
          setIsUserLoggedIn(true);
        }
        return response.data;
      } catch (error) {
        toast.error("Please Login To Continue");
        navigate("/signup");
        return null;
      }
    },
  });

  if (isLoading) {
    return <div className='flex flex-col justify-center items-center w-screen h-screen'><InfinitySpinner /><div className="loading font-mono text-white">Loading<span className="dots"></span></div></div>; // Add a loading state here
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {location.pathname !== "/signup" && location.pathname !== "/takeinterview" && location.pathname !== "/profile" && <NavBar isUserLoggedIn={isUserLoggedIn} />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        {authUser ? (
          <>
            <Route path="/takeinterview" element={<InterviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/interview" element={<InterviewSelection />} />
          </>
        ) : (
          <Route path="/signup" element={<AuthPage />} />
        )}

        {/* If already logged in, redirect away from signup */}
        {authUser && <Route path="/signup" element={<Navigate to="/profile" replace />} />}
      </Routes>
    </>
  );
}

export default App;
