import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Carousel from '../components/Carousel';
import type { Book } from '../types/Book';

type SortOption = 'title' | 'newest';

const HomePage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get sort option from URL params or default to 'title'
  const sortBy: SortOption = useMemo(() => {
    const urlSort = searchParams.get('sort');
    return (urlSort === 'title' || urlSort === 'newest') ? urlSort : 'title';
  }, [searchParams]);

  useEffect(() => {
    fetch('https://localhost:7101/books')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch books');
        return res.json();
      })
      .then((data: Book[]) => {
        setBooks(data);
      })
      .catch(console.error);
  }, []);

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
    <main>
      <div>
        Sort By:
        <button onClick={() => handleSortChange('title')} className={sortBy === 'title' ? 'active' : ''}>
          Title
        </button>
        <span> | </span>
        <button onClick={() => handleSortChange('newest')} className={sortBy === 'newest' ? 'active' : ''}>
          Newest
        </button>
      </div>

      {/* Genre sections will go here */}
      {genres.map(genre => (
        <section key={genre}>
          <Carousel title={genre} books={booksByGenre[genre]} />
        </section>
      ))}
    </main>
  );
};

export default HomePage;