"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (container.current && container.current.children.length === 0) {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
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
          "timezone": "America/Chicago",
          "backgroundColor": "rgba(0, 0, 0, 1)",
          "gridColor": "rgba(46, 46, 46, 0.57)",
          "watchlist": [],
          "withdateranges": true,
          "compareSymbols": [],
          "studies": [],
          "width": 980,
          "height": 610
        }`;
        container.current.appendChild(script);
      }
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/AMEX-SPY/?exchange=AMEX" rel="noopener nofollow" target="_blank"><span className="blue-text">SPY chart by TradingView</span></a></div>
    </div>
  );
}

export default memo(TradingViewWidget);