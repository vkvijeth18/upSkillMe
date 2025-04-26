
import { motion } from "framer-motion";
import movingman from "/running.gif"

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
export default function WhyChooseUpskillMe() {
    return (
        <div className="relative flex flex-col items-center justify-center bg-[#080B1A] text-white py-24 px-8 overflow-hidden">
            {/* Background Gradient Circle */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[60%] bg-purple-700 opacity-20 rounded-full blur-3xl z-0"></div>

            {/* Title */}
            <h2 className="lg:text-4xl md:text-3xl text-2xl font-extrabold text-center text-white mb-16 z-10">
                Why Choose UpskillMe?
            </h2>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 z-10">
                {[
                    {
                        title: "Tailored Feedback",
                        desc: "Receive actionable advice customized for your unique career journey.",
                        icon: "🗽", // Statue of Liberty
                    },
                    {
                        title: "Real-World Interviews",
                        desc: "Practice with real-world scenarios inspired by top NYC companies.",
                        icon: "🏙️", // NYC Skyline
                    },
                    {
                        title: "Expert Mentorship",
                        desc: "Insights from seasoned industry leaders to accelerate your growth.",
                        icon: "🎯", // Target / Focus
                    },
                    {
                        title: "Trackable Growth",
                        desc: "Visualize your improvement through detailed analytics and charts.",
                        icon: "📈", // Analytics chart
                    },
                    {
                        title: "Boost Confidence",
                        desc: "Build the confidence to ace interviews in any high-pressure environment.",
                        icon: "🚀", // Rocket
                    },
                    {
                        title: "NYC Hustle Mindset",
                        desc: "Train with a resilient and dynamic mindset—just like the NYC spirit!",
                        icon: "💼", // Business/Work
                    },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="bg-white/5 p-8 rounded-2xl border border-white/20 shadow-xl hover:shadow-purple-500/30 hover:border-purple-400/40 transition-all duration-300 ease-in-out flex flex-col items-center text-center backdrop-blur-sm"
                    >
                        <div className="text-4xl mb-4">{item.icon}</div>
                        <h3 className="text-xl font-bold text-purple-300 mb-2">
                            {item.title}
                        </h3>
                        <p className="text-gray-300">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Robot/NYC Illustration */}
            <div className="mt-16">
                <motion.div
                    whileHover={{
                        y: -15,
                        rotate: [-2, 2, -2, 0],
                        scale: 1.05,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 18,
                    }}
                >
                    <LazyLoadImage
                        src={movingman}
                        alt="3D Robot"
                        effect="blur"
                        className="w-28 md:w-40 drop-shadow-2xl mix-blend-screen"
                    />
                </motion.div>
            </div>
        </div>
    );
}
