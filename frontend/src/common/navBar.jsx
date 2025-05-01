// Add this to top with other imports
import { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Home, Info, PhoneCall, User, LogIn, LogOut } from 'lucide-react';

const Navbar = ({ isUserLoggedIn }) => {
    const [nav, setNav] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const queryClient = useQueryClient();

    const handleNav = () => setNav(prev => !prev);

    const handleLogOut = async () => {
        try {
            setLoggingOut(true);
            const response = await axios.post(
                "https://upskillme-e2tz.onrender.com/api/v1/auth/logout", {},
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            if (response.data.success) {
                toast.success("Logged out successfully");
                queryClient.invalidateQueries("authUser");
            } else {
                toast.error("Error logging out");
            }
        } catch (error) {
            toast.error("Logout failed");
        } finally {
            setLoggingOut(false);
            setNav(false); // close mobile menu
        }
    };

    const navItems = [
        { id: '1', text: 'Home', link: "/", icon: <Home size={18} /> },
        { id: '2', text: 'About Us', link: "/", icon: <Info size={18} /> },
        { id: '3', text: 'Contact Us', link: "/", icon: <PhoneCall size={18} /> },
        { id: '4', text: 'Profile', link: "/profile", icon: <User size={18} /> },
        { id: '5', text: 'Sign Up', link: "/signup", icon: <LogIn size={18} /> },
        { id: '6', text: 'Log Out', link: "/logout", icon: <LogOut size={18} />, onClick: handleLogOut },
    ];

    return (
        <div className="bg-gradient-to-r from-[#1C1733] to-[#221b3a] flex justify-between items-center h-16 mx-auto px-6 text-white rounded-2xl shadow-lg mt-4 sm:px-10 ml-4 mr-4">

            {/* Logo */}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df]">
                UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span>
            </h1>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex gap-8 text-base font-semibold">
                {navItems
                    .filter(item => {
                        if (item.text === "Sign Up" && isUserLoggedIn) return false;
                        if (item.text === "Log Out" && !isUserLoggedIn) return false;
                        return true;
                    })
                    .map((item) => (
                        <li
                            key={item.id}
                            className="relative group p-2 rounded-md flex items-center gap-2 transition-all duration-300 hover:bg-[#00df9a] hover:text-black cursor-pointer font-medium text-md"
                        >
                            {item.icon}
                            {item.onClick ? (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        item.onClick();
                                    }}
                                    disabled={loggingOut}
                                    className={`transition px-1 ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loggingOut ? "Logging out..." : item.text}
                                </button>
                            ) : (
                                <Link to={item.link}>{item.text}</Link>
                            )}
                        </li>
                    ))}
            </ul>

            {/* Mobile Navigation Icon */}
            <div onClick={handleNav} className="block md:hidden cursor-pointer z-20">
                {nav ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </div>

            {/* Mobile Navigation Menu */}
            <ul
                className={`fixed z-10 md:hidden top-0 left-0 w-[60%] h-full bg-[#1C1733] rounded-tr-3xl rounded-br-3xl p-8 shadow-2xl ease-in-out duration-500 ${nav ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <h1 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df] mb-4">
                    UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span>
                </h1>

                {navItems
                    .filter(item => {
                        if (item.text === "Sign Up" && isUserLoggedIn) return false;
                        if (item.text === "Log Out" && !isUserLoggedIn) return false;
                        return true;
                    })
                    .map((item) => (
                        <li
                            key={item.id}
                            className="p-3 mb-2 flex items-center gap-3 rounded-md hover:bg-[#00df9a] hover:text-black transition-all cursor-pointer font-medium text-sm"
                        >
                            {item.icon}
                            {item.onClick ? (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        item.onClick();
                                    }}
                                    disabled={loggingOut}
                                    className={`text-left w-full ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loggingOut ? "Logging out..." : item.text}
                                </button>
                            ) : (
                                <Link
                                    to={item.link}
                                    onClick={() => setNav(false)}
                                    className="w-full"
                                >
                                    {item.text}
                                </Link>
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default Navbar;
