
"use client";

import React, { useRef, useEffect } from "react";
import { createChart, IChartApi, CandlestickSeries } from "lightweight-charts";

const dummyData = [
  { time: '2024-07-29', open: 101, high: 107, low: 98, close: 105 },
  { time: '2024-07-30', open: 105, high: 112, low: 104, close: 110 },
  { time: '2024-07-31', open: 110, high: 114, low: 109, close: 112 },
  { time: '2024-08-01', open: 112, high: 113, low: 108, close: 109 },
  { time: '2024-08-02', open: 109, high: 111, low: 106, close: 107 },
];

export default function TradingViewLightweightChart() {
  const chartContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#000" },
        textColor: "#fff",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeries.setData(dummyData);

    // Responsive resize
    const handleResize = () => {
        if (chartContainer.current) {
            chart.applyOptions({ width: chartContainer.current.clientWidth });
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
      ref={chartContainer}
      style={{ width: "100%", minHeight: 400, background: "#000" }}
    />
  );
}
