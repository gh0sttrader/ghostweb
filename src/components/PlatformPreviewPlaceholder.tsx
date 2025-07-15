"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export function PlatformPreviewPlaceholder() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const storage = getStorage(app);
                const imageRef = ref(storage, 'platform-preview/preview.png');
                const url = await getDownloadURL(imageRef);
                setImageUrl(url);
            } catch (err: any) {
                // If the image doesn't exist (or another error occurs), we'll just show the placeholder text.
                // You can inspect the error in the console if needed.
                console.warn("Could not load platform preview image:", err.code);
                setError("Image not found.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImage();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton className="w-full h-full" />;
        }

        if (imageUrl) {
            return (
                <Image
                    src={imageUrl}
                    alt="Ghost Trading Platform Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-xl"
                    data-ai-hint="platform dashboard"
                    priority
                />
            );
        }

        // Fallback content if there's an error or no image
        return (
            <p className="text-[#AAA] text-2xl font-semibold">
                Platform preview coming soon...
            </p>
        );
    };

    return (
        <div className="mt-16 w-full md:w-[65%] min-h-[320px] aspect-[16/9] bg-[#181818] rounded-[24px] shadow-lg flex items-center justify-center p-8 relative overflow-hidden">
            {renderContent()}
        </div>
    );
}