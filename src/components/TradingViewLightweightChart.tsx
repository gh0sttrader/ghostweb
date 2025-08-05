"use client";

import React, { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";

export default function TradingViewLightweightChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: 'solid', color: '#000' },
        textColor: '#e0e0e0',
      },
      grid: {
        vertLines: { color: '#222' },
        horzLines: { color: '#222' },
      },
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#444',
      },
      rightPriceScale: {
        borderColor: '#444',
      },
    });

    const lineSeries = chart.addLineSeries({ color: '#66ffcc' });
    lineSeries.setData([
      { time: '2024-08-01', value: 100 },
      { time: '2024-08-02', value: 110 },
      { time: '2024-08-03', value: 105 },
      { time: '2024-08-04', value: 125 },
      { time: '2024-08-05', value: 115 },
    ]);

    // Responsive resize
    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      chart.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: "100%", background: "#000" }}
    />
  );
}
