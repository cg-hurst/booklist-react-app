import { useState } from "react";
import { API_ENDPOINTS } from "../utils/apiConfig";
import { useAuth } from "../context/AuthContext";

import type { Book } from "../types/Book";

interface DeleteBookProps {
    book: Book;
    onBookDeleted: (book: Book) => void;
    onBookDeleteFailed?: (error: Error) => void;
}

const DeleteBook = ({ book, onBookDeleted, onBookDeleteFailed }: DeleteBookProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { fetchWithAuth } = useAuth();

    const handleDelete = async (book: Book): Promise<void> => {
        if (!isDeleting) return;

        try {
            await fetchWithAuth(`${API_ENDPOINTS.BOOKS}/${book.id}`, {
                method: 'DELETE'
            }).then(res => {
                if (!res.ok) throw new Error('Delete failed');
                setIsDeleting(false);
                onBookDeleted(book);
            });
        } catch (error) {
            console.error('Delete failed:', error);
            setIsDeleting(false);
            onBookDeleteFailed?.(error as Error);
        }

    }

    function showDelete(): void {
        setIsDeleting(true);
    }

    function cancelDelete(): void {
        setIsDeleting(false);
    }

    return (
        <>
            <button
                onClick={showDelete}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            >
                Delete
            </button>

            {isDeleting && <>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h2 className="text-xl font-bold text-text mb-4">
                            Confirm Delete
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to delete "{book.title}" by {book.author}?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-surface-hover hover:bg-border text-text rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(book)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </>}
        </>
    )

}

export default DeleteBook;