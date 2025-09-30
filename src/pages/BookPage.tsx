import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBook, useBookDescription } from '../hooks/useBooks';
import { imageCache } from '../utils/imageCache';
import './BookPage.css';

const BookPage = () => {
  const { id } = useParams<{ id: string }>();
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);

  // Use React Query for book data
  const { data: book, isLoading: bookLoading, error: bookError } = useBook(id);

  // Use React Query for description data
  const { data: description, isLoading: descriptionLoading, error: descriptionError } = useBookDescription(book?.openLibraryId);

  useEffect(() => {
    if (!book) return;

    const handleImageCaching = async () => {
      // Check if image is already cached
      const cached = imageCache.getCachedImageUrl(book.coverImageUrl);
      if (cached) {
        setCachedImageUrl(cached);
      } else {
        // Cache the image and get the blob URL
        try {
          const blobUrl = await imageCache.preloadImage(book.coverImageUrl);
          setCachedImageUrl(blobUrl);
        } catch (error) {
          console.warn('Failed to cache image:', error);
          // Fallback to original URL
          setCachedImageUrl(book.coverImageUrl);
        }
      }
    };

    handleImageCaching();
  }, [book]);

  if (bookLoading) return <p>Loading...</p>;
  if (bookError || !book) return <p>Error loading book</p>;

  return (
    <main className="book-information">
      <div className='book-content'>
        <h1>{book.title}</h1>
        <p>By {book.author}</p>
        <p>Published: {book.yearPublished}</p>
        <p>Genre: {book.genre}</p>

        {descriptionLoading && <p>Loading description...</p>}
        {description && (
          <div className="description">
            <h2>Description</h2>
            <p>{description}</p>
            <a href={`https://openlibrary.org/works/${book.openLibraryId}`} target="_blank" rel="noopener noreferrer">
              Description from OpenLibrary
            </a>
          </div>
        )}
        {descriptionError && <p>Description not available.</p>}
        {!descriptionLoading && !description && !descriptionError && <p>No description available.</p>}
      </div>

      {cachedImageUrl ? (
        <img
          src={cachedImageUrl}
          alt={`Cover of ${book.title}`}
        />
      ) : (
        <div className="image-placeholder">Loading image...</div>
      )}
    </main>
  );
};

export default BookPage;