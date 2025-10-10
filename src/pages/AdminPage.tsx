import { useEffect, useRef, useState } from "react"
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import { Notifications, type NotificationFunctions } from "../components/Notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useBooks } from "../hooks/useBooks";
import AddBookForm from "../components/AddBookForm";
import { API_ENDPOINTS } from "../utils/apiConfig";

const AdminPage = () => {

    const [books, setBooks] = useState<Book[]>([]);
    const [deleteBook, setDeleteBook] = useState<Book | null>(null);
    const { fetchWithAuth } = useAuth();

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
            await fetchWithAuth(`${API_ENDPOINTS.BOOKS}/${deleteBook.id}`, {
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            <div className="mb-6 flex justify-end mr-2">
                <AddBookForm
                    onBookAddFailed={(error) => notificationsRef.current?.addNotification(`Failed to add book`, "error")}
                    onBookAdded={(book) => {
                        notificationsRef.current?.addNotification(`Added "${book.title}"`, "success");
                        queryClient.invalidateQueries({ queryKey: ['books'] });
                        setBooks(books => [...books, book].sort((a, b) => a.title.localeCompare(b.title)));

                    }}
                />
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


            <Notifications ref={notificationsRef} />
        </div>
    );
}

export default AdminPage