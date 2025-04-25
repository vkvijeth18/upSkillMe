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
        <div className="flex h-screen bg-gray-900 text-white">
            <div className="w-1/2 flex flex-col items-center justify-center bg-[#101024] p-10">
                {isLogin ? (
                    <>
                        <h3 className="text-lg italic mb-4">LOGIN TO YOUR ACCOUNT</h3>
                        <div className="bg-white text-black p-6 rounded-lg w-80">
                            <div className="mb-4 flex items-center border-b pb-2">
                                <span className="mr-2">👤</span>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    required={true}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full outline-none"
                                />
                            </div>
                            <div className="mb-4 flex items-center border-b pb-2">
                                <span className="mr-2">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required={true}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full outline-none"
                                />
                            </div>
                            <a href="#" className="text-blue-500 text-sm">Forgot Password?</a>
                        </div>
                        <button className="mt-6 bg-blue-500 px-6 py-2 rounded-lg" onClick={handleLogin}>LOGIN</button>
                        <p className="mt-4 text-sm">
                            Don’t have an account?{" "}
                            <button onClick={() => setIsLogin(false)} className="text-blue-400">Create An Account</button>
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-6">SIGN UP</h2>
                        <div className="bg-white text-black p-6 rounded-lg w-80">
                            <div className="mb-4 flex items-center border-b pb-2">
                                <span className="mr-2">👤</span>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    required={true}
                                    value={username}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full outline-none"
                                />
                            </div>
                            <div className="mb-4 flex items-center border-b pb-2">
                                <span className="mr-2">📧</span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required={true}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full outline-none"
                                />
                            </div>
                            <div className="mb-4 flex items-center border-b pb-2">
                                <span className="mr-2">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required={true}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full outline-none"
                                />
                            </div>
                            <div className="mb-4 flex items-center border-b pb-2">
                                <span className="mr-2">🔄</span>
                                <input
                                    type="password"
                                    required={true}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full outline-none"
                                />
                            </div>
                        </div>
                        <button className="mt-6 bg-green-600 px-6 py-2 rounded-lg" onClick={handleSignup}>SIGN UP</button>
                        <p className="mt-4 text-sm">
                            Already have an account?{" "}
                            <button onClick={() => setIsLogin(true)} className="text-blue-400">Login</button>
                        </p>
                    </>
                )}
            </div>

            {/* Right Section (Static Design) */}
            <div className="w-1/2 bg-purple-900 flex flex-col items-center justify-center p-10" style={{
                backgroundImage: `url(${bgImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
                <div className="bg-white p-8 rounded-lg text-center shadow-xl">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="text-black font-semibold">UpSkillMe</p>
                    <p className="text-black text-sm italic">Career Excellence</p>
                </div>
                <div className="mt-4 flex gap-2">
                    <div className={`w-3 h-3 ${isLogin ? "bg-white" : "bg-gray-500"} rounded-full`}></div>
                    <div className={`w-3 h-3 ${isLogin ? "bg-gray-500" : "bg-white"} rounded-full`}></div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;