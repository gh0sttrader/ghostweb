
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface AboutCardProps {
    stock: Stock | null;
    className?: string;
}

const InfoItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
        <div className="font-semibold text-sm text-neutral-400">{label}</div>
        <div className="text-base text-neutral-100 mt-1">{value || '—'}</div>
    </div>
);

export function AboutCard({ stock, className }: AboutCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLong, setIsLong] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    const description = stock?.description || "No description available for this stock.";

    useEffect(() => {
        if (descriptionRef.current) {
            // Check if the text overflows the initial height (approx 3 lines)
            setIsLong(descriptionRef.current.scrollHeight > 72);
        }
    }, [description]);
    
    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <Card className={cn("bg-transparent border-white/10", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold">About</CardTitle>
                <Separator className="bg-white/10 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="text-base text-neutral-300">
                    <p 
                        ref={descriptionRef}
                        className={cn(
                            "transition-all duration-300",
                            !isExpanded && "line-clamp-3"
                        )}
                    >
                        {description}
                    </p>
                    {isLong && (
                        <Button 
                            variant="link" 
                            className="text-primary p-0 h-auto mt-1" 
                            onClick={toggleExpand}
                        >
                            {isExpanded ? 'Show less' : 'Show more'}
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mt-6">
                    <InfoItem label="CEO" value={stock?.ceo} />
                    <InfoItem label="Employees" value={stock?.employees?.toLocaleString()} />
                    <InfoItem label="Headquarters" value={stock?.headquarters} />
                    <InfoItem label="Founded" value={stock?.founded} />
                </div>
            </CardContent>
        </Card>
    );
}
