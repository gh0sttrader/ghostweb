
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 40 40"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ghost Trading Logo"
      {...props}
    >
      <path d="M20 4C12 4 6 10 6 18v10c0 2 1 3 3 3s2-1 4-1 3 1 5 1 3-1 5-1 3 1 5 1c2 0 3-1 3-3V18c0-8-6-14-14-14zM14 20a2 2 0 110-4 2 2 0 010 4zm12 0a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, ease: "linear" } },
    exit: { opacity: 0, transition: { duration: 0.4, ease: "linear" } },
};

const iconAndTextVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
        scale: 1.25, 
        opacity: 1, 
        filter: "drop-shadow(0 0 60px #fff)",
        transition: { 
            duration: 0.8, 
            ease: "easeOut",
            delay: 0.4
        } 
    },
};

const whiteOutVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1.3, ease: "easeInOut" } },
};


export function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [fadeToWhite, setFadeToWhite] = useState(false);

    useEffect(() => {
        const whiteOutTimer = setTimeout(() => {
            setFadeToWhite(true);
        }, 2000); // Start white-out after 2s

        const finishTimer = setTimeout(() => {
            onFinish();
        }, 3300); // Total splash time (2s hold + 1.3s fade)

        return () => {
            clearTimeout(whiteOutTimer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);
    
    return (
        <AnimatePresence>
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]"
                style={{ pointerEvents: "none" }}
            >
                <motion.div
                    variants={iconAndTextVariants}
                    className="flex flex-col items-center"
                >
                     <GhostIcon className="w-40 h-40 mb-2" />
                    <span
                        className="text-4xl md:text-5xl font-bold text-white tracking-wide"
                        style={{ textShadow: '0 0 32px #fff, 0 0 8px #fff' }}
                    >
                        Ghost Trading 2.0
                    </span>
                </motion.div>
                
                <motion.div
                    initial="initial"
                    animate={fadeToWhite ? "animate" : "initial"}
                    variants={whiteOutVariants}
                    className="absolute inset-0 bg-white"
                />
            </motion.div>
        </AnimatePresence>
    );
}
