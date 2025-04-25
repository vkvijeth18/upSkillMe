import { UserCircle, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { invalidate } from '@react-three/fiber';
export function ProfileScreen({ user }) {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null); // 👈 store the file for backend upload
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    useEffect(() => {
        if (user?.data?.profileImage) {
            setImagePreview(user.data.profileImage);
        }
    }, [user])
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // 👈 Save the file
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
        form.append('email', formData.email); // email is unique identifier
        if (formData.oldPassword && formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                return toast.error('New passwords do not match!');
            }
            form.append('oldpass', formData.oldPassword);
            form.append('newpass', formData.newPassword);
        }
        if (imageFile) {
            form.append('profileImage', imageFile);
        }

        try {
            const response = await axios.post('https://upskillme-e2tz.onrender.com/api/v1/getinterviews/updateUserProfile', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }, withCredentials: true,
            });

            toast.success(response.data.message || 'Profile updated!');
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || 'Profile update failed!'
            );
        }
    };

    return (

        <div className="bg-indigo-950 text-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <div className="border border-b-gray-100 p-6 rounded-lg">
                <div className="flex gap-6">
                    {/* Avatar Section */
                    }
                    <div className="relative w-24 h-24">
                        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                            {user?.data?.profileImage ? (
                                <img
                                    src={user?.data?.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <UserCircle size={64} />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-gray-400 rounded-full p-1 cursor-pointer">
                            <Plus size={16} />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 bg-indigo-950 p-4 rounded-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={user?.data?.username || ''}
                                    readOnly
                                    className="w-full px-3 py-2 bg-indigo-900 rounded opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user?.data?.email || ''}
                                    readOnly
                                    className="w-full px-3 py-2 bg-indigo-900 rounded opacity-70 cursor-not-allowed"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm mb-1">Old Password</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-indigo-900 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-indigo-900 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-indigo-900 rounded"
                                />
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-red-600 px-6 py-2 rounded-lg hover:bg-green-500"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
