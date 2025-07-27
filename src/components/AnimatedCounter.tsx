
"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const Odometer = ({ value }: { value: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        `$${Math.round(current).toLocaleString()}`
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return (
        <motion.span ref={ref} className="inline-block w-auto tabular-nums">
            {display}
        </motion.span>
    );
};

export const AnimatedCounter = ({ value }: { value: number }) => {
    return (
        <Odometer value={value} />
    );
};
