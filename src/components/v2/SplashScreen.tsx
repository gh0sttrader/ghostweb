
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
    exit: { opacity: 0, transition: { duration: 0.4, ease: "linear", delay: 0.2 } },
};

const iconVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
        opacity: 1, 
        scale: 1,
        filter: [
            "drop-shadow(0 0 0px white)",
            "drop-shadow(0 0 30px white)",
            "drop-shadow(0 0 18px white)",
        ],
        transition: { 
            duration: 1.1, 
            ease: "easeInOut",
            delay: 0.4 
        } 
    },
};

const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 1.2 } },
};

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsVisible(false);
        }, 2400); // Total splash screen time before starting exit animation

        const finishTimeout = setTimeout(onFinish, 2800); // 2.4s + 0.4s exit transition

        return () => {
            clearTimeout(timeout);
            clearTimeout(finishTimeout);
        };
    }, [onFinish]);
    
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]"
                >
                    <div className="relative flex flex-col items-center">
                         <motion.div variants={iconVariants}>
                            <GhostIcon className="w-24 h-24" />
                        </motion.div>
                        <motion.span
                            variants={textVariants}
                            className="mt-8 text-white text-2xl font-bold tracking-wide"
                        >
                            Ghost Trading 2.0
                        </motion.span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
