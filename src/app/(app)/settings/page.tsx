"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the chart component with SSR turned off to prevent server-side rendering errors.
const TradingViewLightweightChart = dynamic(
  () => import('@/components/TradingViewLightweightChart'),
  { ssr: false }
);

export default function SettingsPage() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", padding: 24 }}>
      <TradingViewLightweightChart />
    </div>
  );
}
