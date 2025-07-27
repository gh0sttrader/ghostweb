
"use client";

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Timer, PieChart, ArrowDownUp, Landmark, BookOpenCheck } from 'lucide-react';
import type { TradingFeatures } from '@/types';

const featureIcons: { [K in keyof Required<TradingFeatures>]: { icon: React.ElementType; label: string; description: string; activeClass: string; } } = {
    overnight: { icon: Timer, label: "Overnight Trading", description: "This security can be traded after market hours.", activeClass: "bg-green-500/10 text-green-400" },
    fractional: { icon: PieChart, label: "Fractional Shares", description: "You can buy or sell less than one full share.", activeClass: "bg-orange-500/10 text-orange-400" },
    shortable: { icon: ArrowDownUp, label: "Shortable", description: "This security can be sold short.", activeClass: "bg-purple-500/10 text-purple-400" },
    marginable: { icon: Landmark, label: "Marginable", description: "You can borrow funds to trade this security.", activeClass: "bg-blue-500/10 text-blue-400" },
    nasdaqTotalView: { icon: BookOpenCheck, label: "NASDAQ TotalView", description: "Deepest level of market data is available.", activeClass: "bg-pink-500/10 text-pink-400" },
    optionsAvailable: { icon: PieChart, label: "Options Available", description: "Options trading is available for this security.", activeClass: "bg-teal-500/10 text-teal-400" },
    preAfterMarket: { icon: Timer, label: "Pre/After-Market", description: "This security can be traded in pre-market and after-hours.", activeClass: "bg-indigo-500/10 text-indigo-400" },
};

interface TradingFeaturesBadgesProps {
    features: TradingFeatures;
    className?: string;
}

export const TradingFeaturesBadges: React.FC<TradingFeaturesBadgesProps> = ({ features, className }) => {
    return (
        <TooltipProvider>
            <div className={cn("flex items-center gap-2", className)}>
                {Object.entries(features).map(([key, value]) => {
                    const feature = featureIcons[key as keyof typeof featureIcons];
                    if (!feature) return null;
                    const { icon: Icon, description, activeClass } = feature;
                    const isActive = !!value;

                    return (
                        <Tooltip key={key}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200",
                                    isActive ? activeClass : "bg-transparent text-neutral-500"
                                )}>
                                    <Icon className="h-3 w-3" strokeWidth={2} />
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
