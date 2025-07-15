
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GhostSVG = () => (
    <svg width="64" height="64" fill="none" viewBox="0 0 48 48">
        <path d="M24 6c-10 0-16 7.5-16 18.5V40c0 1.5 2 1.5 2 0s2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2 0 2-1.5V24.5C40 13.5 34 6 24 6z"
        fill="#FFF" stroke="#FFF" strokeWidth={1.5}/>
        <circle cx="18" cy="20" r="2.5" fill="#000"/>
        <circle cx="30" cy="20" r="2.5" fill="#000"/>
    </svg>
);

export default function GhostFloating() {
  const [show, setShow] = useState(true);
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShow(false), 3300); // Main animation ends
    const timer2 = setTimeout(() => setPeek(true), 3700);  // Peek animation begins after a delay

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            aria-hidden="true"
            style={{
              position: "fixed",
              top: "35%",
              left: 0,
              zIndex: 50,
              pointerEvents: "none",
            }}
            initial={{ x: "-120px", opacity: 1, rotate: -6 }}
            animate={{ x: "100vw", opacity: 1, rotate: 6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.2, ease: "easeInOut" }}
          >
            <GhostSVG />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {peek && (
          <motion.div
            aria-hidden="true"
            style={{
              position: "fixed",
              top: "35%",
              right: 0,
              width: "32px", // Half of the SVG's width (64px / 2)
              height: "64px",
              overflow: "hidden",
              zIndex: 40,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          >
            <GhostSVG />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
