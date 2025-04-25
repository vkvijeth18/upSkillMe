export default function GetInTouch() {
    return (
        <div className="relative flex flex-col items-center justify-center py-20 px-6 bg-[#080B1A] text-white ">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-transparent blur-3xl opacity-50"></div>

            {/* Container */}
            <div className="relative max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-6">Get in Touch</h2>
                <p className="text-gray-300 mb-8">
                    Have any questions or suggestions? Drop your details and we'll get back to you!
                </p>

                {/* Contact Form */}
                <form className="flex flex-col space-y-4">
                    {/* Email Input */}
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all duration-300 outline-none"
                        required
                    />

                    {/* Message Input */}
                    <textarea
                        placeholder="Write your message here..."
                        className="w-full h-32 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all duration-300 outline-none resize-none"
                        required
                    ></textarea>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
                    >
                        Send Message
                    </button>
                </form>
            </div>

            {/* Footer Section */}
            <footer className="relative mt-16 border-t border-gray-600 pt-8 w-full">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400">
                    {/* Brand Name */}
                    <h3 className="text-xl font-bold text-white">UpskillMe</h3>

                    {/* Navigation Links */}
                    <ul className="flex space-x-6 text-sm mt-4 md:mt-0">
                        <li><a href="#" className="hover:text-blue-400 transition">About</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Services</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                    </ul>

                    {/* Copyright Text */}
                    <p className="text-sm mt-4 md:mt-0">© 2025 UpskillMe. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
