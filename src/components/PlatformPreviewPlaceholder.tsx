
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export function PlatformPreviewPlaceholder() {
    const [imageError, setImageError] = useState(false);
    const imageUrl = "https://firebasestorage.googleapis.com/v0/b/ghost-trading.firebasestorage.app/o/Ghost_Trading.png?alt=media&token=582fe62a-2491-4acb-9fa4-02744abf05d7";

    const renderContent = () => {
        if (imageError) {
            return (
                <p className="text-[#AAA] text-2xl font-semibold">
                    Platform preview coming soon...
                </p>
            );
        }

        return (
            <Image
                src={imageUrl}
                alt="Ghost Trading Platform Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
                data-ai-hint="platform dashboard"
                priority
                onError={() => setImageError(true)}
            />
        );
    };

    return (
        <div className="mt-16 w-full md:w-[65%] min-h-[320px] aspect-[16/9] bg-[#181818] rounded-[24px] shadow-lg flex items-center justify-center p-8 relative overflow-hidden">
            {renderContent()}
        </div>
    );
}
