"use client";

import TradingViewWidget from '@/components/TradingViewWidget';

export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      paddingTop: '2rem',
    }}>
      <TradingViewWidget />
    </div>
  );
}