import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageCache } from '../utils/imageCache';

import type { Book } from "../types/Book";
import './Carousel.css';

interface CarouselProps {
    title: string;
    books: Book[];
}

const Carousel = ({ title, books }: CarouselProps) => {
    const [cachedImageUrls, setCachedImageUrls] = useState<Map<number, string>>(new Map());

    const navigate = useNavigate();

    const handleBookClick = (bookId: number) => {
        navigate(`/book/${bookId}`);
    };

    // Cache images individually as they load
    useEffect(() => {
        books.forEach(async (book) => {
            try {
                // Check if already cached in memory
                const cached = await imageCache.getCachedImageUrl(book.coverImageUrl);
                if (cached) {
                    setCachedImageUrls(prev => new Map(prev).set(book.id, cached));
                } else {
                    // Cache the image and get the blob URL
                    const blobUrl = await imageCache.preloadImage(book.coverImageUrl);
                    setCachedImageUrls(prev => new Map(prev).set(book.id, blobUrl));
                }
            } catch (error) {
                console.warn(`Failed to cache image for ${book.title}:`, error);
                // Fallback to original URL
                setCachedImageUrls(prev => new Map(prev).set(book.id, book.coverImageUrl));
            }
        });
    }, [books]);

    return (
        <div className="carousel">
            <h2 className="carousel-title">{title}</h2>
            <div className="carousel-items">
                {books.map(book => {
                    const cachedUrl = cachedImageUrls.get(book.id);
                    
                    return (
                        <div key={book.id} className="carousel-item" onClick={() => handleBookClick(book.id)}>
                            <div className="carousel-item-info">
                                <h3>{book.title}</h3>
                                <p>{book.author}</p>
                            </div>
                            {cachedUrl ? (
                                <img 
                                    src={cachedUrl} 
                                    alt={book.title}
                                />
                            ) : (
                                <div className="image-placeholder">Loading...</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Carousel;
