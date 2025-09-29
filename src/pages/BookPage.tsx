import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Book } from '../types/Book';
import './BookPage.css';

const BookPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loadingDescription, setLoadingDescription] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`https://localhost:7101/books/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch book');
        return res.json();
      })
      .then((book: Book) => {
        setBook(book);
        
        // Fetch description from OpenLibrary if openLibraryId exists
        if (book.openLibraryId) {
          setLoadingDescription(true);
          fetch(`https://openlibrary.org/works/${book.openLibraryId}.json`)
            .then(res => res.json())
            .then(data => {
              if (data.description) {
                // Handle both string and object formats
                const desc = typeof data.description === 'string' 
                  ? data.description 
                  : data.description.value;
                setDescription(desc);
              }
            })
            .catch(() => {
              setDescription('Description not available.');
            })
            .finally(() => {
              setLoadingDescription(false);
            });
        }
      })
      .catch(console.error);
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <main className="book-information">
      <div className='book-content'>
        <h1>{book.title}</h1>
        <p>By {book.author}</p>
        <p>Published: {book.yearPublished}</p>
        <p>Genre: {book.genre}</p>
        
        {loadingDescription && <p>Loading description...</p>}
        {description && (
          <div className="description">
            <h2>Description</h2>
            <p>{description}</p>
            <a href={`https://openlibrary.org/works/${book.openLibraryId}`} target="_blank" rel="noopener noreferrer">Description from OpenLibrary</a>
          </div>
        )}
        {!loadingDescription && !description && <p>No description available.</p>}
      </div>
      <img src={book.coverImageUrl} alt={`Cover of ${book.title}`} />
    </main>
  );
};

export default BookPage;