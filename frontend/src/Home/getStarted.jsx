import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function HowToGetStarted() {
    return (
        <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0f24] to-[#080B1A] py-20 px-6">
            {/* Floating Balls */}
            <LazyLoadImage src="/ball.png" alt="Ball" effect="blur" className="hidden md:block absolute top-[20%] left-10 w-14 opacity-50" />
            <LazyLoadImage src="/ball.png" alt="Ball" effect="blur" className="hidden md:block absolute bottom-[20%] right-10 w-14 opacity-50" />

            {/* Main Container */}
            <div className="relative w-full max-w-6xl bg-black/80 border-2 border-blue-400/30 p-10 rounded-2xl shadow-2xl backdrop-blur-md">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl blur-2xl opacity-30"></div>

                {/* Title */}
                <h2 className="text-4xl md:text-3xl font-extrabold text-center text-white mb-16">
                    How To <span className="text-green-400">Get Started?</span>
                </h2>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                    {[
                        { img: "/signIn.png", title: "Sign Up", desc: "Create your profile and set your career goals." },
                        { img: "/clock.png", title: "Schedule", desc: "Book mock interviews based on your job role." },
                        { img: "/goal.png", title: "Up-skill", desc: "Access curated resources to master interviews." },
                        { img: "/feedback.png", title: "Get Feedback", desc: "Receive instant detailed feedback and analytics." },
                    ].map((step, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10, scale: 1.05 }}
                            className="flex flex-col items-center p-6 rounded-xl bg-white/10 border border-blue-400/20 hover:border-blue-400 shadow-md hover:shadow-blue-500/30 transition-all"
                        >
                            <LazyLoadImage src={step.img} alt={step.title} effect="blur" className="w-16 h-16 mb-4" />
                            <h3 className="text-xl font-bold text-purple-300 mb-2">{step.title}</h3>
                            <p className="text-gray-300 text-center text-sm">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <p className="mt-16 text-center text-gray-400 text-lg">
                    Start Your Journey Today! <br />
                    Don’t leave your dream job to chance. <span className="text-green-400 font-semibold">Prepare, Practice, Perfect with UpskillMe.</span>
                </p>
            </div>
        </div>

    );
}
