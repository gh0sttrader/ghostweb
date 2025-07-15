
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GhostSVG = () => (
    <svg width="64" height="64" fill="none" viewBox="0 0 48 48">
        <path d="M24 6c-10 0-16 7.5-16 18.5V40c0 1.5 2 1.5 2 0s2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2 0 2-1.5V24.5C40 13.5 34 6 24 6z"
        fill="#FFF" stroke="#FFF" strokeWidth={1.5}/>
        <circle cx="18" cy="20" r="2.5" fill="#000"/>
        <circle cx="30" cy="20" r="2.5" fill="#000"/>
    </svg>
);

export default function GhostFloating() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3500); // matches animation duration
    return () => clearTimeout(timer);
  }, []);

  return (
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
  );
}
