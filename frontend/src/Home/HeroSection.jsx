import React from "react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link } from "react-router-dom";
export default function HeroSection() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-evenly bg-[#0f142f] px-10 md:px-20 py-10 mt-6 rounded-xl mx-4">
            {/* Left Content */}
            <div className="md:w-1/2 text-white">
                <h1 className="lg:text-4xl md:text-3xl sm:text-xl  font-bold leading-tight">
                    Welcome to UpskillMe
                    <br />
                    Your Gateway to Career Excellence
                </h1>
                <p className="mt-6 lg:text-xl md:text-lg sm:text-sm text-gray-300">
                    At UpskillMe, we believe that preparation is the key to success. Our
                    platform is designed to help you ace your job interviews with
                    confidence and competence. Whether you're a recent graduate, a career
                    switcher, or a professional aiming to refine your skills, UpskillMe
                    offers the perfect environment to practice and improve.
                </p>

                <Link to="/interview">
                    <div className="flex items-center mt-6">
                        <button className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold w-[130px] h-[50px]">
                            <p className="text-sm ">Get Started</p>
                        </button>
                    </div>
                </Link>
            </div>

            {/* Right Side Image */}
            <div className="md:w-1/2 flex justify-center items-center">
                {/* Floating Image */}
                <motion.div
                    className="w-[60%] md:w-[60%] rounded-lg shadow-lg flex justify-center items-center"
                    animate={{ y: [0, -10, 0] }} // Move up and down
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <LazyLoadImage
                        src="/interview.png" // Replace with the correct path
                        alt="Interview Practice"
                        effect="blur"
                        className="w-full h-auto rounded-lg"
                    />
                </motion.div>
            </div>
        </div>
    );
}
