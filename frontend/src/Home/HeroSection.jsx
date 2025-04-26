import React from "react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link } from "react-router-dom";
export default function HeroSection() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#0f142f] via-[#151a3a] to-[#0f142f] px-6 md:px-16 py-14 mt-8 rounded-3xl mx-4 shadow-2xl">

            {/* Left Content */}
            <div className="md:w-1/2 text-white space-y-6">
                <h1 className="text-3xl md:text-4xl font-extrabold leading-snug tracking-tight">
                    Welcome to <span className="text-purple-400">UpskillMe</span>
                    <br />
                    Your Gateway to <span className="text-blue-400">Career Excellence</span>
                </h1>

                <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                    At UpskillMe, preparation meets opportunity.
                    Whether you're a graduate, career switcher, or professional — we offer
                    the perfect environment to sharpen your skills and ace your interviews.
                </p>

                <Link to="/interview">
                    <button className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all rounded-full text-sm md:text-base font-semibold shadow-md">
                        Get Started
                    </button>
                </Link>
            </div>

            {/* Right Side Image */}
            <div className="md:w-1/2 flex justify-center items-center mt-10 md:mt-0">
                <motion.div
                    className="w-[80%] md:w-[70%] rounded-2xl overflow-hidden "

                >
                    <LazyLoadImage
                        src="/home.png"
                        alt="Interview Practice"
                        effect="blur"
                        className="w-full h-auto object-cover"
                    />
                </motion.div>
            </div>

        </div>
    );

}
