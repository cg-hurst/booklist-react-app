import { Link, useParams } from 'react-router-dom';
import { useBook, useBookDescription } from '../hooks/useBooks';
import OpenLibraryImage from '../components/OpenLibraryImage';

const BookPage = () => {
  const { id } = useParams<{ id: string }>();

  // Use React Query for book data
  const { data: book, isLoading: bookLoading, error: bookError } = useBook(id);

  // Use React Query for description data
  const { data: description, isLoading: descriptionLoading, error: descriptionError } = useBookDescription(book?.openLibraryId);

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
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-text transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Books
        </Link>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
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
            <OpenLibraryImage coverImageUrl={book.coverImageUrl} widthClass='w-full' heightClass='h-auto' />
          </div>
        </div>
      </div>
    </>
  );
};

export default BookPage;