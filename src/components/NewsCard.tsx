
"use client";

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { dummyNewsData } from '@/app/(app)/news/dummy-data';
import { formatDistanceToNowStrict } from 'date-fns';
import type { Stock } from '@/types';
import Link from 'next/link';
import { Button } from './ui/button';

const RelativeTime = ({ isoString }: { isoString: string }) => {
    try {
        const date = new Date(isoString);
        return <>{formatDistanceToNowStrict(date)} ago</>;
    } catch (e) {
        return <>Invalid date</>;
    }
};

interface NewsCardProps {
    stock: Stock | null;
    className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ stock, className }) => {
    const relevantNews = useMemo(() => {
        if (!stock) return [];
        return dummyNewsData
            .filter(item => item.symbol === stock.symbol)
            .slice(0, 3);
    }, [stock]);

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="flex justify-between items-center pb-3">
                <h2 className="text-xl font-bold">News</h2>
                <Button variant="link" className="text-primary text-sm p-0 h-auto">
                    Show more
                </Button>
            </div>
            {relevantNews.length > 0 ? (
                <div className="space-y-8">
                    {relevantNews.map(item => (
                        <div key={item.id}>
                            <div className="text-neutral-400 text-xs mb-1">
                                {item.provider} &middot; <RelativeTime isoString={item.timestamp} />
                            </div>
                            <Link href={`/news?q=${item.headline}`} passHref legacyBehavior>
                                <a target="_blank" rel="noopener noreferrer" className="block font-bold text-base mb-1 hover:underline">
                                    {item.headline}
                                </a>
                            </Link>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {item.preview}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-neutral-500">No recent news available for {stock?.symbol || 'this stock'}.</p>
            )}
        </div>
    );
};
