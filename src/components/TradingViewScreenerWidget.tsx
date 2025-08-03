
"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewScreenerWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (container.current && container.current.children.length === 0) {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
        {
          "width": "100%",
          "height": "100%",
          "defaultColumn": "overview",
          "screener_type": "crypto_mkt",
          "displayCurrency": "USD",
          "colorTheme": "dark",
          "locale": "en",
          "backgroundColor": "#000000"
        }`;
        container.current.appendChild(script);
      }
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewScreenerWidget);
