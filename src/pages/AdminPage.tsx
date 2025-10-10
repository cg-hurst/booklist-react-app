import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query";
import { useBooks } from "../hooks/useBooks";

import { Notifications, type NotificationFunctions } from "../components/Notifications";
import BookCard from "../components/BookCard";
import AddBookForm from "../components/AddBookForm";
import DeleteBook from "../components/DeleteBook";

import type { Book } from "../types/Book";

const AdminPage = () => {

    const [books, setBooks] = useState<Book[]>([]);
    const notificationsRef = useRef<NotificationFunctions>(null);
    const queryClient = useQueryClient();

    const { data: booksData } = useBooks();
    useEffect(() => void (booksData && setBooks(booksData.sort((a, b) => a.title.localeCompare(b.title)))), [booksData]);

     return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            <div className="mb-6 flex justify-end mr-2">
                <AddBookForm
                    onBookAddFailed={() => notificationsRef.current?.addNotification(`Failed to add book`, "error")}
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
                            <DeleteBook book={book}
                                onBookDeleted={(deletedBook: Book) => {
                                    // Remove from local state
                                    queryClient.invalidateQueries({ queryKey: ['books'] });
                                    queryClient.invalidateQueries({ queryKey: ['book', deletedBook.id] });
                                    queryClient.invalidateQueries({ queryKey: ['description', deletedBook.openLibraryId] });
                                    setBooks(books => books.filter(book => book.id !== deletedBook.id));
                                    notificationsRef.current?.addNotification(`Deleted "${deletedBook.title}"`, "success");
                                }}
                                onBookDeleteFailed={() => notificationsRef.current?.addNotification(`Failed to delete book`, "error")}
                                />
                        </div>
                    </div>
                ))}
            </div>

            <Notifications ref={notificationsRef} />
        </div>
    );
}

export default AdminPage