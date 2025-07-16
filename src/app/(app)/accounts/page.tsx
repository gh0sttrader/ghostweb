
"use client";

import { useState } from 'react';
import type { Stock } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';

const mockAccountStock: Stock = {
    id: 'account_overview',
    symbol: 'PORTFOLIO',
    price: 170000,
    changePercent: 1.2,
    historicalPrices: [165000, 166000, 165500, 167000, 168000, 169500, 170000],
}

export default function AccountsPage() {
    const [accountData, setAccountData] = useState<Stock>(mockAccountStock);

    const handleTickerSubmit = (symbol: string) => {
        // This will be used in the future to switch between different account views
        console.log("Account view switched to:", symbol);
    };

    return (
        <main className="flex flex-1 h-full overflow-hidden p-4 md:p-6">
            <div className="w-full max-w-6xl">
                 <InteractiveChartCard
                    stock={accountData}
                    onManualTickerSubmit={handleTickerSubmit}
                    variant="account"
                    className="h-[75vh]"
                />
            </div>
        </main>
    );
}
