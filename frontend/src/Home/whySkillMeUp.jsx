
import { motion } from "framer-motion";
import movingman from "/running.gif"

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
export default function WhyChooseUpskillMe() {
    return (
        <div className="relative flex flex-col items-center justify-center bg-[#080B1A] text-white py-20 px-6">
            {/* Background Gradient Circles */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[80%] h-[60%] bg-purple-900 opacity-30 rounded-full blur-3xl"></div>

            {/* Title */}
            <h2 className="lg:text-3xl md:text-2xl sm:text-xl font-bold text-center text-white mb-12">
                Why Choose UpskillMe?
            </h2>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center z-10">
                {[
                    {
                        title: "Personalized Feedback:",
                        desc: "Get constructive feedback to identify your strengths and areas for improvement.",
                    },
                    {
                        title: "Realistic Mock Interviews:",
                        desc: "Simulate real face-to-face interviews with industry-relevant questions.",
                    },
                    {
                        title: "Expert Insights:",
                        desc: "Learn from curated tips and strategies from industry professionals.",
                    },
                    {
                        title: "Track Your Progress:",
                        desc: "Monitor your performance and growth with detailed analytics.",
                    },
                    {
                        title: "Realistic Mock Interviews:",
                        desc: "Simulate real face-to-face interviews with industry-relevant questions.",
                    },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="bg-white/10 p-6 rounded-lg border border-white/20 shadow-lg w-80 transition-all duration-300 ease-in-out 
                                   hover:border-blue-400 hover:shadow-md hover:shadow-blue-400/50"
                    >
                        <h3 className="text-xl font-bold text-purple-400">
                            {item.title}
                        </h3>
                        <p className="text-gray-300 mt-2">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Robot Illustration */}
            <div className="mt-6">
                <motion.div
                    whileHover={{
                        y: -20,
                        rotate: [-3, 3, -3, 0],
                        scale: 1.1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                    }}
                >
                    <LazyLoadImage
                        src={movingman}
                        alt="3D Man"
                        effect="blur"
                        className="hidden sm:block w-20 md:w-[200px] drop-shadow-xl mix-blend-screen border-none"
                    />
                </motion.div>
            </div>
        </div>
    );
}
