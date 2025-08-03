
"use client";

import dynamic from 'next/dynamic';
import React, { useState, useRef, useEffect, useCallback } from "react";

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

export default function SettingsPage() {
  const [height, setHeight] = useState(500); // Default 500px
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragging.current && containerRef.current) {
      const minHeight = 280;
      const maxHeight = window.innerHeight * 0.9;
      
      // Adjust clientY by the top offset of the container to get relative position
      const containerTop = containerRef.current.getBoundingClientRect().top;
      let newHeight = e.clientY - containerTop;
      
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      setHeight(newHeight);
    }
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className="flex flex-col items-center w-full px-6 pt-8">
      <div
        ref={containerRef}
        className="w-full max-w-6xl relative"
        style={{
          minHeight: "280px",
          maxHeight: "90vh",
          height: `${height}px`,
          transition: dragging.current ? "none" : "height 0.2s",
        }}
      >
        <div style={{ height: '100%', width: '100%' }}>
            <TradingViewWidget />
        </div>
        <div
          onMouseDown={onMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "12px",
            cursor: "ns-resize",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "#444"
            }}
          />
        </div>
      </div>
      {/* Add additional cards/components below here as needed */}
    </div>
  );
}
