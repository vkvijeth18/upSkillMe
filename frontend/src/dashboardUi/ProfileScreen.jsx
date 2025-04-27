import { UserCircle, Plus, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import InfinitySpinner from '../../loaders/InfinitySpinner.jsx';
export function ProfileScreen({ user }) {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.data) {
            setFormData({
                username: user.data.username || '',
                email: user.data.email || '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            if (user.data.profileImage) {
                setImagePreview(user.data.profileImage);
            }
            setLoading(false); // Data loaded
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('New passwords do not match!');
        }

        const form = new FormData();
        form.append('username', formData.username);
        form.append('email', formData.email);

        if (formData.oldPassword && formData.newPassword) {
            form.append('oldpass', formData.oldPassword);
            form.append('newpass', formData.newPassword);
        }

        if (imageFile) {
            form.append('profileImage', imageFile);
        }

        try {
            setLoading(true);
            const response = await axios.post(
                'https://upskillme-e2tz.onrender.com/api/v1/getinterviews/updateUserProfile',
                form,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                }
            );
            toast.success(response.data.message || 'Profile updated!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Profile update failed!');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[500px]">
                <div className="text-white text-lg"> <InfinitySpinner /></div>
                <div class="loading font-mono text-white">Loading<span class="dots"></span></div>
            </div >
        );
    }
    return (
        <div className="bg-indigo-950 text-white p-8 rounded-2xl shadow-md w-full max-w-5xl min-w-[340px] mx-auto sm:mt-1 md:mt-6 lg:mt-10 min-h-[500px] overflow-hidden">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="relative w-32 h-32 mx-auto md:mx-0">
                    <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.data?.profileImage ? (
                            <img
                                src={user.data.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <UserCircle size={80} className="text-gray-400" />
                        )}
                    </div>
                    <label className="absolute bottom-1 right-1 bg-green-500 hover:bg-green-600 rounded-full p-2 cursor-pointer transition">
                        <Plus size={16} className="text-black" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>

                {/* Form Section */}
                <div className="flex-1 bg-[#232368] p-6 border-gray-500 rounded-xl">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={user?.data?.username || ''}
                                readOnly
                                className="w-full px-4 py-2 bg-[#2A2A2D] rounded-lg opacity-70 cursor-not-allowed"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user?.data?.email || ''}
                                readOnly
                                className="w-full px-4 py-2 bg-[#2A2A2D] rounded-lg opacity-70 cursor-not-allowed"
                            />
                        </div>

                        {/* Old Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Old Password</label>
                            <div className="flex items-center bg-[#2A2A2D] rounded-lg">
                                <input
                                    type={showPassword.oldPassword ? 'text' : 'password'}
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    placeholder="Enter old password"
                                    className="w-full px-4 py-2 bg-transparent rounded-lg focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('oldPassword')}
                                    className="p-2 text-gray-400"
                                >
                                    {showPassword.oldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <div className="flex items-center bg-[#2A2A2D] rounded-lg">
                                <input
                                    type={showPassword.newPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 bg-transparent rounded-lg focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('newPassword')}
                                    className="p-2 text-gray-400"
                                >
                                    {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <div className="flex items-center bg-[#2A2A2D] rounded-lg">
                                <input
                                    type={showPassword.confirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 bg-transparent rounded-lg focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    className="p-2 text-gray-400"
                                >
                                    {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${loading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
                                    } text-white px-6 py-2 rounded-lg font-semibold transition`}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
