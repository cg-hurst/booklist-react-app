import { Link } from "react-router-dom";
import OpenLibraryImage from "./OpenLibraryImage";
import type { Book } from "../types/Book";

const BookCard = ({ book }: { book: Book }) => {
    return (
        <Link to={`/book/${book.id}`} className="book-card">
            <div className="book-card-info">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">{book.author}</p>
            </div>

            <div className="book-card-image">
                <OpenLibraryImage coverImageUrl={book.coverImageUrl} widthClass="w-36" heightClass="h-full" />
            </div>
        </Link>
    );
}

export default BookCard;