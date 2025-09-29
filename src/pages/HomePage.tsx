import { useEffect, useMemo, useState } from 'react';
import Carousel from '../components/Carousel';
import type { Book } from '../types/Book';

const HomePage = () => {
  const [books, setBooks] = useState<Book[]>([]);

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
        books.sort((a, b) => a.title.localeCompare(b.title))
      ])
    );
  }, [books]);

  const genres = useMemo(() => {
    return Object.keys(booksByGenre).sort();
  }, [booksByGenre]);

  return (
    <main>

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