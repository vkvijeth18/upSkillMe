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
        <div className="bg-[#1C1733] flex justify-between items-center h-16  min-w-[100px] mx-auto px-4 text-white rounded-lg font-mono mt-2 sm:p-6 ml-4 mr-4">
            {/* Logo */}
            <h1 className="text-4xl font-bold text-[#0091df]">UpSkiLLMe.<span className='text-2xl'>inc</span></h1>

            {/* Desktop Navigation */}
            {/* //{//console.log(isUserLoggedIn)} */}
            <ul className="hidden md:flex gap-10 text-lg">
                {navItems
                    .filter(item => {
                        // Show "Sign Up" only if NOT logged in
                        if (item.text === "Sign Up" && isUserLoggedIn) return false;

                        // Show "Log Out" only if IS logged in
                        if (item.text === "Log Out" && !isUserLoggedIn) return false;

                        return true;
                    })
                    .map((item) => (
                        <li
                            key={item.id}
                            className="p-4 hover:bg-[#00df9a] rounded-xl cursor-pointer duration-300 hover:text-black"
                        >
                            {item.onClick ? (
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    item.onClick();
                                }}>
                                    {item.text}
                                </button>
                            ) : (
                                <Link to={item.link}>{item.text}</Link>
                            )}
                        </li>
                    ))
                }
            </ul>

            {/* Mobile Navigation Icon */}
            <div onClick={handleNav} className="block md:hidden cursor-pointer">
                {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
            </div>

            {/* Mobile Navigation Menu */}
            <ul
                className={`fixed md:hidden left-0 top-0 w-[60%] h-full border-r border-gray-900 bg-[#1C1733] ease-in-out duration-500 ${nav ? 'left-0' : 'left-[-100%]'}`}
            >
                {/* Mobile Logo */}
                <h1 className="text-3xl font-bold text-[#0091df] m-4">UpSkiLLMe.<span className='text-2xl'>inc</span></h1>

                {/* Mobile Navigation Items */}
                {navItems
                    .filter(item => {
                        // Show "Sign Up" only if NOT logged in
                        if (item.text === "Sign Up" && isUserLoggedIn) return false;

                        // Show "Log Out" only if IS logged in
                        if (item.text === "Log Out" && !isUserLoggedIn) return false;

                        return true;
                    })
                    .map((item) => (
                        <li
                            key={item.id}
                            className="p-4 border-b rounded-xl hover:bg-[#00df9a] duration-300 hover:text-black cursor-pointer border-gray-600"
                        >
                            {item.onClick ? (
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    item.onClick();
                                }}>
                                    {item.text}
                                </button>
                            ) : (
                                <Link to={item.link}>{item.text}</Link>
                            )}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
};

export default Navbar;