
"use client";

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Timer, PieChart, ArrowDownUp, Landmark, BookOpenCheck } from 'lucide-react';
import type { TradingFeatures } from '@/types';

const featureIcons: { [K in keyof Required<TradingFeatures>]: { icon: React.ElementType; label: string; description: string } } = {
    overnight: { icon: Timer, label: "Overnight Trading", description: "This security can be traded after market hours." },
    fractional: { icon: PieChart, label: "Fractional Shares", description: "You can buy or sell less than one full share." },
    shortable: { icon: ArrowDownUp, label: "Shortable", description: "This security can be sold short." },
    marginable: { icon: Landmark, label: "Marginable", description: "You can borrow funds to trade this security." },
    nasdaqTotalView: { icon: BookOpenCheck, label: "NASDAQ TotalView", description: "Deepest level of market data is available." },
    optionsAvailable: { icon: PieChart, label: "Options Available", description: "Options trading is available for this security." },
    preAfterMarket: { icon: Timer, label: "Pre/After-Market", description: "This security can be traded in pre-market and after-hours." },
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
                    const { icon: Icon, description } = feature;
                    return (
                        <Tooltip key={key}>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center w-7 h-7 bg-transparent border border-white rounded-lg transition-all duration-200 hover:shadow-[0_0_4px_#fff]">
                                    <Icon className="h-4 w-4 text-white" strokeWidth={1.5} />
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
