import React, { useState } from "react";
import bgImg from "/bg.jpg";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const signupUser = async (userData) => {
        const response = await axios.post("https://upskillme-e2tz.onrender.com/api/v1/auth/signup", userData, { headers: { "Content-Type": "application/json" }, withCredentials: true });
        return response.data;
    };

    const loginUser = async (userData) => {
        const response = await axios.post("https://upskillme-e2tz.onrender.com/api/v1/auth/login", userData, { headers: { "Content-Type": "application/json" }, withCredentials: true });
        return response.data;
    };

    const signupMutation = useMutation({
        mutationFn: signupUser,
        onSuccess: () => {
            setIsLogin(true);
            toast.success("Signup successful:");
            // Redirect or show success message
            navigate("/");
            queryClient.invalidateQueries("authUser");

        },
        onError: (error) => {
            toast.error("Signup failed:", error.response?.data?.message || error.message);
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: () => {
            setIsLogin(true);
            toast.success("Login successful:");
            // Redirect or show success message
            navigate("/");

            queryClient.invalidateQueries("authUser");
        },
        onError: (error) => {
            toast.error("Login failed:", error.response?.data?.message || error.message);
        },
    });

    const handleLogin = () => {
        const userData = { username: username, password: password };
        loginMutation.mutate(userData);
    };

    const handleSignup = () => {
        const userData = { username: username, email: email, password: password, confirmPassword: confirmPassword };
        signupMutation.mutate(userData); // Triggers signup
    };

    return (
        <div className="flex items-center justify-center w-full h-screen bg-[#0A0A23] text-white">
            <div className="w-full max-w-lg bg-[#101024] p-8 rounded-2xl shadow-lg">
                {isLogin ? (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm mb-2">User Name</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    required
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-blue-400 hover:underline">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold transition"
                                onClick={handleLogin}
                            >
                                Log in
                            </button>

                            <p className="text-center text-sm mt-6">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className="text-blue-400 hover:underline"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    required
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Email address</label>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    required
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <button
                                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-md font-semibold transition"
                                onClick={handleSignup}
                            >
                                Sign up
                            </button>

                            <p className="text-center text-sm mt-6">
                                Already have an account?{" "}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="text-blue-400 hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

};

export default AuthPage;