
"use client";

import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center w-full px-6 pt-8">
      <div
        className="w-full max-w-6xl"
        style={{
          minHeight: "440px",
          height: "45vh",
          padding: "0",
          margin: "0 auto",
        }}
      >
        <TradingViewWidget />
      </div>
      {/* Add additional cards/components below here as needed */}
    </div>
  );
}
