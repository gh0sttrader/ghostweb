
"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const AverageAnnualReturn = ({ className }: { className?: string }) => {
    const returnData = [
        { label: '% Price Return', '1Y': '14.94%', '3Y': '19.56%', '5Y': '16.57%', '10Y': '13.55%', 'Since': '10.48%' },
        { label: '% NAV Return', '1Y': '15.05%', '3Y': '19.59%', '5Y': '16.53%', '10Y': '13.55%', 'Since': '10.51%' },
    ];
    const headers = ['1Y', '3Y', '5Y', '10Y', 'Since'];

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">Average Annual Return</h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-neutral-700">
                            <th className="py-3 pr-4 font-normal text-sm text-neutral-400 w-1/4"></th>
                            {headers.map(header => (
                                <th key={header} className="py-3 px-4 font-normal text-sm text-neutral-400 text-center">
                                    {header === 'Since' ? <span>Since<br/>Jan 22, 1993</span> : header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {returnData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-neutral-800 last:border-b-0">
                                <td className="py-4 pr-4 font-semibold text-white">{row.label}</td>
                                {headers.map(header => (
                                    <td key={header} className="py-4 px-4 text-white text-center font-mono">{row[header as keyof typeof row]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-neutral-500 mt-4">As of June 30, 2025</p>
        </div>
    );
};

export { AverageAnnualReturn };
