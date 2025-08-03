
"use client";

import dynamic from 'next/dynamic';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ResizableBox } from "react-resizable";
import 'react-resizable/css/styles.css';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });
const TradingViewScreenerWidget = dynamic(() => import('@/components/TradingViewScreenerWidget'), { ssr: false });

export default function SettingsPage() {
  const [size, setSize] = useState({ width: 900, height: 500 });
  const resizing = useRef({ active: false, dir: null as string | null, startX: 0, startY: 0, startW: 0, startH: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const onResizeStart = useCallback((dir: string, e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = {
      active: true,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    document.body.style.userSelect = "none";
  }, [size.width, size.height]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing.current.active) return;
    let { dir, startX, startY, startW, startH } = resizing.current;
    let deltaX = e.clientX - startX;
    let deltaY = e.clientY - startY;
    let newWidth = startW;
    let newHeight = startH;

    if (dir?.includes("right")) newWidth = startW + deltaX;
    if (dir?.includes("left")) newWidth = startW - deltaX;
    if (dir?.includes("bottom")) newHeight = startH + deltaY;
    if (dir?.includes("top")) newHeight = startH - deltaY;

    newWidth = Math.max(300, Math.min(newWidth, window.innerWidth * 0.98));
    newHeight = Math.max(200, Math.min(newHeight, window.innerHeight * 0.9));

    setSize({ width: newWidth, height: newHeight });
  }, []);

  const onMouseUp = useCallback(() => {
    resizing.current.active = false;
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const Handle = ({ dir, cursor }: { dir: string, cursor: string }) => (
    <div
      onMouseDown={(e) => onResizeStart(dir, e)}
      style={{
        cursor,
        zIndex: 20,
        position: "absolute",
        ...(dir === "right" && { top: 0, right: 0, width: 10, height: "100%" }),
        ...(dir === "left" && { top: 0, left: 0, width: 10, height: "100%" }),
        ...(dir === "top" && { top: 0, left: 0, width: "100%", height: 10 }),
        ...(dir === "bottom" && { bottom: 0, left: 0, width: "100%", height: 10 }),
        ...(dir === "top-left" && { top: 0, left: 0, width: 16, height: 16 }),
        ...(dir === "top-right" && { top: 0, right: 0, width: 16, height: 16 }),
        ...(dir === "bottom-left" && { bottom: 0, left: 0, width: 16, height: 16 }),
        ...(dir === "bottom-right" && { bottom: 0, right: 0, width: 16, height: 16 }),
      }}
    />
  );

  return (
    <div className="flex flex-col items-center w-full px-6 pt-8">
      <div
        ref={containerRef}
        className="relative bg-black rounded-xl"
        style={{
          width: size.width,
          height: size.height,
          minWidth: 300,
          minHeight: 200,
          maxWidth: "98vw",
          maxHeight: "90vh",
        }}
      >
        <div style={{ height: '100%', width: '100%' }}>
            <TradingViewWidget />
        </div>
        {/* Sides */}
        <Handle dir="right" cursor="ew-resize" />
        <Handle dir="left" cursor="ew-resize" />
        <Handle dir="top" cursor="ns-resize" />
        <Handle dir="bottom" cursor="ns-resize" />
        {/* Corners */}
        <Handle dir="top-left" cursor="nwse-resize" />
        <Handle dir="top-right" cursor="nesw-resize" />
        <Handle dir="bottom-left" cursor="nesw-resize" />
        <Handle dir="bottom-right" cursor="nwse-resize" />
      </div>
      
      <ResizableBox
        width={1100}
        height={550}
        minConstraints={[400, 350]}
        maxConstraints={[1600, 1000]}
        resizeHandles={["s", "e", "se", "n", "w", "nw", "ne", "sw"]}
        className="bg-black mt-10 mb-20 p-2 border border-neutral-800 rounded-xl"
      >
        <TradingViewScreenerWidget />
      </ResizableBox>
    </div>
  );
}
