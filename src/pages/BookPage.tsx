import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBook, useBookDescription } from '../hooks/useBooks';
import { useNavigate } from 'react-router-dom';
import { imageCache } from '../utils/imageCache';

const BookPage = () => {
  const { id } = useParams<{ id: string }>();
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Use React Query for book data
  const { data: book, isLoading: bookLoading, error: bookError } = useBook(id);

  // Use React Query for description data
  const { data: description, isLoading: descriptionLoading, error: descriptionError } = useBookDescription(book?.openLibraryId);

  useEffect(() => {
    if (!book) return;

    let objectUrl: string | null = null;

    const handleImageCaching = async () => {
      try {
        // Get blob from cache and create object URL
        const blob = await imageCache.preloadImage(book.coverImageUrl);
        objectUrl = URL.createObjectURL(blob);
        setCachedImageUrl(objectUrl);
      } catch (error) {
        console.warn('Failed to cache image:', error);
        // Fallback to original URL (no cleanup needed)
        setCachedImageUrl(book.coverImageUrl);
      }
    };

    handleImageCaching();

    // Cleanup function to revoke object URL
    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
      setCachedImageUrl(null);
    };
  }, [book]);

  if (bookLoading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );

  if (bookError || !book)
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <div className="text-text-secondary">
          Error loading book
        </div>
        <Link
          to="/"
          className="btn-primary"
        >
          Back to List
        </Link>
      </div>
    );

  return (
    <>
      <div className="max-w-6xl mx-auto p-8">

        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-text transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Books
        </Link>


        <main className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Book details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-text mb-4 leading-tight">
                {book.title}
              </h1>

              <div className="space-y-3">
                <p className="text-lg text-text-secondary">
                  <span className="font-semibold">Author:</span> {book.author}
                </p>

                <p className="text-lg text-text-secondary">
                  <span className="font-semibold">Year:</span> {book.yearPublished}
                </p>

                <p className="text-lg text-text-secondary">
                  <span className="font-semibold">Genre:</span>
                  <span className="inline-block ml-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {book.genre}
                  </span>
                </p>
              </div>
            </div>

            {descriptionLoading && <p>Loading description...</p>}

            {description && (

              <div>
                <h2 className="text-xl font-semibold text-text mb-3">Description</h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  {description}
                </p>
                <a className="text-primary" href={`https://openlibrary.org/works/${book.openLibraryId}`} target="_blank" rel="noopener noreferrer">
                  Description from OpenLibrary
                </a>
              </div>

            )}
            {descriptionError && <p>Description not available.</p>}
            {!descriptionLoading && !description && !descriptionError && <p>No description available.</p>}
          </div>

          <div className="md:col-span-1 order-first">
            {cachedImageUrl ? (

              <img
                src={cachedImageUrl}
                alt={`Cover of ${book.title}`}
                className="w-100 h-auto rounded-lg shadow-lg bg-surface"
              />
            ) : (
              <div className="image-placeholder">Loading image...</div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default BookPage;