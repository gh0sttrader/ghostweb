
"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (container.current) {
        // Clear the container before appending the new script to prevent duplicates on re-render
        container.current.innerHTML = "";
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": true,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "en",
          "save_image": true,
          "style": "2",
          "symbol": "AMEX:SPY",
          "theme": "dark",
          "timezone": "Etc/UTC",
          "backgroundColor": "rgba(0, 0, 0, 1)",
          "gridColor": "rgba(15, 15, 15, 0.62)",
          "watchlist": [
            "AMEX:VOO",
            "NASDAQ:SOXX"
          ],
          "withdateranges": true,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;
        container.current.appendChild(script);
      }
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/AMEX-SPY/?exchange=AMEX" rel="noopener nofollow" target="_blank"><span className="blue-text">SPY chart by TradingView</span></a></div>
    </div>
  );
}

export default memo(TradingViewWidget);
