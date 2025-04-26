import { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const Navbar = ({ isUserLoggedIn }) => {
    const [nav, setNav] = useState(false);

    const handleNav = () => {
        setNav(!nav);
    };


    const queryClient = useQueryClient();

    const handleLogOut = async () => {
        try {
            const response = await axios.post(
                "https://upskillme-e2tz.onrender.com/api/v1/auth/logout", {},
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            if (response.data.success) {
                ////console.log("✅  Response:", response.data);
                toast.success("Logged out Sucessfully");
                queryClient.invalidateQueries("authUser");
            } else {
                console.error("❌ Invalid response:", response.data);
                toast.error("Error logging out");
            }
        } catch (error) {
            console.error("❌ Error In logout", error);
        }
    }

    const navItems = [
        { id: '1', text: 'Home', link: "/" },
        { id: '2', text: 'About Us', link: "/" },
        { id: '3', text: 'Contact Us', link: "/" },
        { id: '4', text: 'Profile', link: "/profile" },
        { id: '5', text: 'Sign Up', link: "/signup" },
        { id: '6', text: 'Log Out', link: "/logout", onClick: handleLogOut },
    ];

    return (
        <div className="bg-gradient-to-r from-[#1C1733] to-[#221b3a] flex justify-between items-center h-16 min-w-[100px] mx-auto px-6 text-white rounded-2xl shadow-lg  mt-4 sm:px-10 ml-4 mr-4">

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
                            className="relative group p-2 rounded-md  transition-all duration-300  hover:bg-[#00df9a] hover:text-black  cursor-pointer font-medium text-md"
                        >
                            {item.onClick ? (
                                <button onClick={(e) => { e.preventDefault(); item.onClick(); }}>
                                    {item.text}
                                </button>
                            ) : (
                                <Link to={item.link}>{item.text}</Link>
                            )}
                            <button className="absolute left-0 -bottom-1 w-0 h-[2px]"></button>
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
                {/* Mobile Logo */}
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00df9a] to-[#0091df] mb-3">
                    UpSkiLLMe<span className="text-xs ml-1 text-gray-400">.inc</span>
                </h1>

                {/* Mobile Navigation Items */}
                {navItems
                    .filter(item => {
                        if (item.text === "Sign Up" && isUserLoggedIn) return false;
                        if (item.text === "Log Out" && !isUserLoggedIn) return false;
                        return true;
                    })
                    .map((item) => (
                        <li
                            key={item.id}
                            onClick={() => {
                                handleNav(); // close the mobile menu
                                if (item.onClick) item.onClick(); // also run item's onClick if exists
                            }}
                            className="p-3 mb-2 rounded-md hover:bg-[#00df9a] hover:text-black transition-all cursor-pointer font-medium text-sm"
                        >
                            {item.onClick ? (
                                <button>
                                    {item.text}
                                </button>
                            ) : (
                                <Link to={item.link}>{item.text}</Link>
                            )}
                        </li>
                    ))}

            </ul>

        </div>
    );
};

export default Navbar;