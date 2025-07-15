
"use client";

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Timer, PieChart, ArrowDownUp, Landmark, BookOpenCheck } from 'lucide-react';
import type { TradingFeatures } from '@/types';

const featureIcons: { [K in keyof Required<TradingFeatures>]: { icon: React.ElementType; label: string; description: string; style: string } } = {
    overnight: { icon: Timer, label: "Overnight Trading", description: "This security can be traded after market hours.", style: "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/30" },
    fractional: { icon: PieChart, label: "Fractional Shares", description: "You can buy or sell less than one full share.", style: "bg-gradient-to-br from-lime-400 to-green-600 shadow-lg shadow-green-500/30" },
    shortable: { icon: ArrowDownUp, label: "Shortable", description: "This security can be sold short.", style: "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30" },
    marginable: { icon: Landmark, label: "Marginable", description: "You can borrow funds to trade this security.", style: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/30" },
    nasdaqTotalView: { icon: BookOpenCheck, label: "NASDAQ TotalView", description: "Deepest level of market data is available.", style: "bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-fuchsia-500/30" },
    optionsAvailable: { icon: PieChart, label: "Options Available", description: "Options trading is available for this security.", style: "bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg shadow-purple-500/30" },
    preAfterMarket: { icon: Timer, label: "Pre/After-Market", description: "This security can be traded in pre-market and after-hours.", style: "bg-gradient-to-br from-blue-400 to-sky-600 shadow-lg shadow-sky-500/30" },
};

interface TradingFeaturesBadgesProps {
    features: TradingFeatures;
    className?: string;
}

export const TradingFeaturesBadges: React.FC<TradingFeaturesBadgesProps> = ({ features, className }) => {
    return (
        <TooltipProvider>
            <div className={cn("flex items-center gap-1.5", className)}>
                {Object.entries(features).map(([key, value]) => {
                    if (!value) return null;
                    const feature = featureIcons[key as keyof typeof featureIcons];
                    if (!feature) return null;
                    const { icon: Icon, description, style } = feature;
                    return (
                        <Tooltip key={key}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "h-6 w-6 flex items-center justify-center rounded-md transition-all hover:brightness-125",
                                    style
                                )}>
                                    <Icon className="h-3.5 w-3.5 text-white" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{description}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
};
