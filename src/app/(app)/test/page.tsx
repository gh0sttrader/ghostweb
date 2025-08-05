
"use client";

import TradingViewLightweightChart from '@/components/TradingViewLightweightChart';

export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 64px)', // Adjust 64px to your nav's height
      width: '100%',
      padding: '2rem',
    }}>
      <div style={{ width: '980px', height: '610px' }}>
        <TradingViewLightweightChart />
      </div>
    </div>
  );
}
