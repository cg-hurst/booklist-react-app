import { useState } from "react";
import type { NewBook } from "../types/NewBook";
import { useAuth } from "../context/AuthContext";
import type { Book } from "../types/Book";
import { API_ENDPOINTS } from "../utils/apiConfig";

interface AddBookFormProps {
    onBookAdded?: (book: Book) => void;
    onCancel?: () => void;
    onBookAddFailed?: (error: Error) => void;
}

const AddBookForm = ({ onBookAddFailed, onCancel, onBookAdded }: AddBookFormProps) => {
    const [newBook, setNewBook] = useState<NewBook | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { fetchWithAuth } = useAuth();

    const showForm = () => {
        setNewBook({
            title: "",
            author: "",
            genre: "",
            yearPublished: new Date().getFullYear(),
            coverImageUrl: "",
            openLibraryId: ""
        });
    };

    const cancelAddBook = (): void => {
        setNewBook(null);
        onCancel?.();
    }

    const updateNewBook = (field: keyof NewBook, value: string | number) => {
        setNewBook(prev => prev ? { ...prev, [field]: value } : prev);
    }

    const addBook = async () => {
        if (!newBook || isSubmitting) return;

        setIsSubmitting(true);
        
        try {
            // Log the data we're sending
            const response = await fetchWithAuth(API_ENDPOINTS.BOOKS, {
                method: 'POST',
                body: JSON.stringify(newBook),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const createdBook: Book = await response.json();
            
            setNewBook(null);
            onBookAdded?.(createdBook);
        } catch (error) {
            setNewBook(null);
            onBookAddFailed?.(error as Error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Validate form before allowing submission
    const isFormValid = newBook && 
        newBook.title.trim() !== '' && 
        newBook.author.trim() !== '' && 
        newBook.genre.trim() !== '' && 
        newBook.yearPublished > 0;

    // Only render the modal if newBook is not null
    if (!newBook) {
        return (
            <button 
                onClick={showForm}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
            >
                Add New Book
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-text mb-4">Add New Book</h2>
                <form onSubmit={(e) => { e.preventDefault(); addBook(); }} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-text-secondary font-medium mb-2">Title *</label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={newBook.title}
                            onChange={(e) => updateNewBook('title', e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="author" className="block text-text-secondary font-medium mb-2">Author *</label>
                        <input
                            id="author"
                            type="text"
                            required
                            value={newBook.author}
                            onChange={(e) => updateNewBook('author', e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="genre" className="block text-text-secondary font-medium mb-2">Genre *</label>
                        <input
                            id="genre"
                            type="text"
                            required
                            value={newBook.genre}
                            onChange={(e) => updateNewBook('genre', e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="year" className="block text-text-secondary font-medium mb-2">Year Published *</label>
                        <input
                            id="year"
                            type="number"
                            required
                            min="1000"
                            max={new Date().getFullYear() + 1}
                            value={newBook.yearPublished}
                            onChange={(e) => updateNewBook('yearPublished', parseInt(e.target.value) || new Date().getFullYear())}
                            className="w-full py-2 px-3 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="coverImageUrl" className="block text-text-secondary font-medium mb-2">Cover Image URL</label>
                        <input
                            id="coverImageUrl"
                            type="url"
                            value={newBook.coverImageUrl}
                            onChange={(e) => updateNewBook('coverImageUrl', e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="openLibraryId" className="block text-text-secondary font-medium mb-2">Open Library ID</label>
                        <input
                            id="openLibraryId"
                            type="text"
                            value={newBook.openLibraryId}
                            onChange={(e) => updateNewBook('openLibraryId', e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., OL123456W"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={cancelAddBook}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-surface-hover hover:bg-border text-text rounded font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-medium transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBookForm;