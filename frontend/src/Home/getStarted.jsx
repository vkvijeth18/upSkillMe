import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function HowToGetStarted() {
    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Floating Balls */}
            <LazyLoadImage
                src="/ball.png"
                alt="Floating Ball"
                effect="blur"
                className="sm:hidden md:block absolute left-[80px] top-[50%] w-20 h-20 opacity-80 md:visible"
            />
            <LazyLoadImage
                src="/ball.png"
                alt="Floating Ball"
                effect="blur"
                className="sm:hidden md:block absolute right-[80px] top-[50%] w-20 h-20 opacity-80 md:visible"
            />

            {/* Neon Border Container */}
            <div className="relative w-full max-w-md md:max-w-4xl p-8 rounded-xl border-2 border-green-500/50 bg-black/90 shadow-xl hover:border-blue-400 hover:shadow-md">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
                    How To Get Started?
                </h2>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[80%] h-[80%] bg-blue-400 opacity-30 rounded-full blur-3xl"></div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Step 1 - Sign Up */}
                    <motion.div className="flex flex-col items-center text-center p-6 rounded-lg border border-blue-500/50 bg-black/80 shadow-md hover:border-blue-400 transition-all">
                        <LazyLoadImage
                            src="/signIn.png"
                            alt="Sign Up"
                            effect="blur"
                            className="w-20 h-20 mb-4"
                        />
                        <p className="text-gray-300 text-lg">
                            <strong className="text-white">Sign Up:</strong> Create your profile and set your career goals.
                        </p>
                    </motion.div>

                    {/* Step 2 - Schedule Interviews */}
                    <motion.div className="flex flex-col items-center text-center p-6 rounded-lg border border-blue-500/50 bg-black/80 shadow-md hover:border-blue-400 transition-all">
                        <LazyLoadImage
                            src="/clock.png"
                            alt="Schedule Interviews"
                            effect="blur"
                            className="w-20 h-20 mb-4"
                        />
                        <p className="text-gray-300 text-lg">
                            <strong className="text-white">Schedule Mock Interviews:</strong> Choose from various interview scenarios tailored to your job role.
                        </p>
                    </motion.div>

                    {/* Step 3 - Up-skill */}
                    <motion.div className="flex flex-col items-center text-center p-6 rounded-lg border border-blue-500/50 bg-black/80 shadow-md hover:border-blue-400 transition-all">
                        <LazyLoadImage
                            src="/goal.png"
                            alt="Up-skill"
                            effect="blur"
                            className="w-20 h-20 mb-4"
                        />
                        <p className="text-gray-300 text-lg">
                            <strong className="text-white">Up-skill:</strong> Access resources and tips to refine your interview techniques.
                        </p>
                    </motion.div>

                    {/* Step 4 - Instant Feedback */}
                    <motion.div className="flex flex-col items-center text-center p-6 rounded-lg border border-blue-500/50 bg-black/80 shadow-md hover:border-blue-400 transition-all">
                        <LazyLoadImage
                            src="/feedback.png"
                            alt="Instant Feedback"
                            effect="blur"
                            className="w-20 h-20 mb-4"
                        />
                        <p className="text-gray-300 text-lg">
                            <strong className="text-white">Get Instant Feedback:</strong> Receive instant, actionable feedback to help you improve.
                        </p>
                    </motion.div>
                </div>

                {/* Footer */}
                <p className="mt-12 text-center text-gray-400 text-lg">
                    Start Your Journey Today! <br />
                    Don’t leave your dream job to chance. Prepare, practice, and perfect your interview skills with{" "}
                    <strong className="text-green-400">UpskillMe.</strong>
                </p>
            </div>
        </div>
    );
}
