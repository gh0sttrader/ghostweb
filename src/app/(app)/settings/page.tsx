"use client";

import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

export default function SettingsPage() {
  return (
    <main className="w-full h-full bg-black">
      <TradingViewWidget />
    </main>
  );
}
