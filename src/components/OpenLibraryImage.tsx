import { useState, useEffect, useRef } from 'react';
import { imageCache } from '../utils/imageCache';

interface BookCoverProps {
    coverImageUrl: string;
    widthClass: string;
    heightClass: string;
}

const OpenLibraryImage = ({ coverImageUrl, widthClass, heightClass }: BookCoverProps) => {
    const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        // Reset the ref when effect runs
        objectUrlRef.current = null;
        setCachedImageUrl(null);

        const fetchImage = async () => {
            try {
                // Get blob from cache and create object URL
                const blob = await imageCache.preloadImage(coverImageUrl);
                const objectUrl = URL.createObjectURL(blob);
                
                // Store in ref so cleanup can access it
                objectUrlRef.current = objectUrl;
                setCachedImageUrl(objectUrl);
            } catch (error) {
                console.warn('Failed to cache image:', error);
                // Fallback to original URL (no cleanup needed for this)
                setCachedImageUrl(coverImageUrl);
            }
        };
        
        fetchImage();

        // Cleanup function accesses the ref
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [coverImageUrl]); 

    return (
        !cachedImageUrl ? (
            <div className={`${widthClass || 'w-full'} ${heightClass || 'h-full'} bg-surface animate-pulse rounded`} />
        ) : (
            <img
                src={cachedImageUrl}
                alt="Book Cover"
                className={`${widthClass || 'w-full'} ${heightClass || 'h-full'} object-cover rounded-lg shadow-lg bg-surface`}
                loading="lazy"
            />
        )
    );
};

export default OpenLibraryImage;
