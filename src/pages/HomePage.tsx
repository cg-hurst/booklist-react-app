import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Carousel from '../components/Carousel';
import type { Book } from '../types/Book';
import { useBooks } from '../hooks/useBooks';

type SortOption = 'title' | 'newest';

const HomePage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get sort option from URL params or default to 'title'
  const sortBy: SortOption = useMemo(() => {
    const urlSort = searchParams.get('sort');
    return (urlSort === 'title' || urlSort === 'newest') ? urlSort : 'title';
  }, [searchParams]);

  const { data: booksData } = useBooks();
  useEffect(() => void (booksData && setBooks(booksData)), [booksData]);

  const sortBooks = (books: Book[], sortOption: SortOption): Book[] => {
    switch (sortOption) {
      case 'title':
        return [...books].sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
        return [...books].sort((a, b) => b.yearPublished - a.yearPublished);
      default:
        return books;
    }
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', newSortOption);
      return newParams;
    });
  };

  const booksByGenre = useMemo(() => {
    const grouped = books.reduce((acc, book) => {
      if (!acc[book.genre]) {
        acc[book.genre] = [];
      }
      acc[book.genre].push(book);
      return acc;
    }, {} as Record<string, Book[]>);

    // Sort books within each genre
    return Object.fromEntries(
      Object.entries(grouped).map(([genre, books]) => [
        genre,
        sortBooks(books, sortBy)
      ])
    );
  }, [books, sortBy]);

  const genres = useMemo(() => {
    return Object.keys(booksByGenre).sort();
  }, [booksByGenre]);

  return (
    <div>
      {/* Sort controls */}
      <div className="mb-8 flex items-center gap-3">
        <span className="text-text-secondary font-medium">Sort By:</span>
        <button 
          onClick={() => handleSortChange('title')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'title'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-surface-hover text-text-secondary'
          }`}
        >
          Title
        </button>
        <span className="text-text-muted">|</span>
        <button 
          onClick={() => handleSortChange('newest')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'newest'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-surface-hover text-text-secondary'
          }`}
        >
          Newest
        </button>
      </div>

      {/* Genre sections */}
      <div className="space-y-8">
        {genres.map(genre => (
          <section key={genre}>
            <Carousel title={genre} books={booksByGenre[genre]} />
          </section>
        ))}
      </div>
    </div>
  );
};

export default HomePage;