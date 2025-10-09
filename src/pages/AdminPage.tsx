import { useEffect, useRef, useState } from "react"
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import { Notifications, type NotificationFunctions } from "../components/Notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useBooks } from "../hooks/useBooks";

interface NewBook {
    title: string;
    author: string;
    genre: string;
    yearPublished: number;
    coverImageUrl: string;
    openLibraryId: string;
}

const AdminPage = () => {

    const [books, setBooks] = useState<Book[]>([]);
    const [deleteBook, setDeleteBook] = useState<Book | null>(null);
    const { fetchWithAuth } = useAuth();

    const [newBook, setNewBook] = useState<NewBook | null>(null);
    const notificationsRef = useRef<NotificationFunctions>(null);
    const queryClient = useQueryClient();

    ;
    const { data: booksData } = useBooks();
    useEffect(() => void (booksData && setBooks(booksData.sort((a, b) => a.title.localeCompare(b.title)))), [booksData]);

    const handleDelete = (book: Book): void => {
        setDeleteBook(book);
    }

    const cancelDelete = (): void => {
        setDeleteBook(null);
    }

    const confirmDelete = async () => {
        if (!deleteBook) return;

        try {
            await fetchWithAuth(`https://localhost:7101/books/${deleteBook.id}`, {
                method: 'DELETE'
            }).then(res => {
                if (!res.ok) throw new Error('Delete failed');

                notificationsRef.current?.addNotification(`Deleted "${deleteBook.title}"`, "success");

                // Remove from local state
                queryClient.invalidateQueries({ queryKey: ['books'] });
                queryClient.invalidateQueries({ queryKey: ['book', deleteBook.id] });
                queryClient.invalidateQueries({ queryKey: ['description', deleteBook.openLibraryId] });
                setBooks(books => books.filter(book => book.id !== deleteBook.id));
                setDeleteBook(null);
            });
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }

    const cancelAddBook = (): void => {
        setNewBook(null);
    }

    const showAddBookModal = () => {
        setNewBook({
            title: "",
            author: "",
            genre: "",
            yearPublished: new Date().getFullYear(),
            coverImageUrl: "",
            openLibraryId: ""
        });
    };

    const updateNewBook = (field: keyof NewBook, value: string | number) => {
        setNewBook(prev => prev ? { ...prev, [field]: value } : prev);
    }

    const addBook = async () => {

        if (!newBook) return;

        try {
            await fetchWithAuth('https://localhost:7101/books', {
                method: 'POST',
                body: JSON.stringify(newBook),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (!res.ok) throw new Error('Add book failed');
                return res.json();
            }).then((createdBook: Book) => {
                notificationsRef.current?.addNotification(`Added "${createdBook.title}"`, "success");
                setBooks(books => [...books, createdBook].sort((a, b) => a.title.localeCompare(b.title)));
                setNewBook(null);
                // Clear useBooks react cache
                queryClient.invalidateQueries({ queryKey: ['books'] });
            });
        } catch (error) {
            setNewBook(null);
            notificationsRef.current?.addNotification('Failed to add book', "error");
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            <div className="flex items-center justify-between mb-6">
                <button onClick={showAddBookModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">Add new book</button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 gap-y-12">
                {books.map((book) => (
                    <div key={book.id} className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center">
                            <BookCard book={book} />
                        </div>

                        <div className="mt-1 flex gap-2 items-center justify-center">
                            <button
                                onClick={() => handleDelete(book)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {deleteBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h2 className="text-xl font-bold text-text mb-4">
                            Confirm Delete
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to delete "{deleteBook.title}" by {deleteBook.author}?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-surface-hover hover:bg-border text-text rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {newBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-text mb-4">Add New Book</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
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
                                    onChange={(e) => updateNewBook('yearPublished', parseInt(e.target.value))}
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
                        </form>

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={cancelAddBook}
                                className="px-4 py-2 bg-surface-hover hover:bg-border text-text rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addBook}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-medium transition-colors"
                            >
                                Add Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Notifications ref={notificationsRef} />
        </div>
    );
}

export default AdminPage