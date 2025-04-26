import React, { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // 👁️ Icons for toggle

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const signupUser = async (userData) => {
        const response = await axios.post(
            "https://upskillme-e2tz.onrender.com/api/v1/auth/signup",
            userData,
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    };

    const loginUser = async (userData) => {
        const response = await axios.post(
            "https://upskillme-e2tz.onrender.com/api/v1/auth/login",
            userData,
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    };

    const signupMutation = useMutation({
        mutationFn: signupUser,
        onSuccess: () => {
            setIsLogin(true);
            toast.success("Signup successful!");
            navigate("/");
            queryClient.invalidateQueries("authUser");
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            toast.error(errorMessage);
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: () => {
            setIsLogin(true);
            toast.success("Login successful!");
            navigate("/");
            queryClient.invalidateQueries("authUser");
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            toast.error(errorMessage);
        },
    });

    const handleLogin = () => {
        const userData = { username, password };
        loginMutation.mutate(userData);
    };

    const handleSignup = () => {
        const userData = { username, email, password, confirmPassword };
        signupMutation.mutate(userData);
    };

    return (
        <div className="flex items-center justify-center w-full h-screen bg-[#0A0A23] text-white">
            <div className="w-full max-w-lg bg-[#101024] p-8 rounded-2xl shadow-lg">
                {isLogin ? (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>

                        <div className="space-y-6">
                            {/* Username Input */}
                            <div>
                                <label className="block text-sm mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    required
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-3 rounded-md bg-[#1A1A3C] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm mb-2">Password</label>
                                <div className="flex items-center bg-[#1A1A3C] border border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 bg-transparent focus:outline-none rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="flex items-center justify-center px-3 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
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
                            {/* Username */}
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

                            {/* Email */}
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

                            {/* Password */}
                            <div>
                                <label className="block text-sm mb-2">Password</label>
                                <div className="flex items-center bg-[#1A1A3C] border border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-green-500">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 bg-transparent focus:outline-none rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="flex items-center justify-center px-3 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm mb-2">Confirm Password</label>
                                <div className="flex items-center bg-[#1A1A3C] border border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-green-500">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        required
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-3 bg-transparent focus:outline-none rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="flex items-center justify-center px-3 text-gray-400"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
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
