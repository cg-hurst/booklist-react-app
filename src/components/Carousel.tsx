import { useRef, useState, useEffect } from 'react';
import type { Book } from '../types/Book';
import BookCard from './BookCard';

interface CarouselProps {
  title: string;
  books: Book[];
}

const Carousel = ({ title, books }: CarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);

    // When books change scroll back to start
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }

    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [books]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth;
    const currentScroll = container.scrollLeft;
    
    // Book item width is 144px (w-36) + 16px gap = 160px total per item
    const itemWidth = 144; // w-36 in pixels
    const gap = 16; // 1rem gap
    const totalItemWidth = itemWidth + gap;
    
    // Calculate how many complete books fit in the visible area
    const booksPerPage = Math.floor(containerWidth / totalItemWidth);
    
    // Calculate scroll distance (number of books * total width per book)
    const scrollDistance = booksPerPage * totalItemWidth;
    
    let targetScroll;
    if (direction === 'left') {
      targetScroll = Math.max(0, currentScroll - scrollDistance);
    } else {
      targetScroll = currentScroll + scrollDistance;
      
      // Don't scroll past the end
      const maxScroll = container.scrollWidth - containerWidth;
      targetScroll = Math.min(targetScroll, maxScroll);
      
      // If we're close to the end, just scroll to show remaining items
      if (maxScroll - targetScroll < totalItemWidth) {
        targetScroll = maxScroll;
      }
    }
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  if (books.length === 0) return null;

  return (
    <section className="carousel group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="carousel-title">{title}</h2>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-colors ${
              canScrollLeft 
                ? 'bg-surface hover:bg-surface-hover text-text' 
                : 'bg-surface/50 text-text-muted cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-colors ${
              canScrollRight 
                ? 'bg-surface hover:bg-surface-hover text-text' 
                : 'bg-surface/50 text-text-muted cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="book-cards"
        onScroll={checkScrollButtons}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default Carousel;
