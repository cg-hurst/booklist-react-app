import { useNavigate } from 'react-router-dom';
import type { Book } from "../types/Book";
import './Carousel.css';

interface CarouselProps {
    title: string;
    books: Book[];
}

const Carousel = ({ title, books }: CarouselProps) => {
    const navigate = useNavigate();

    const handleBookClick = (bookId: number) => {
        navigate(`/book/${bookId}`);
    };

    return (
        <div className="carousel">
            <h2 className="carousel-title">{title}</h2>
            <div className="carousel-items">
                {books.map(book => (
                    <div key={book.id} className="carousel-item" onClick={() => handleBookClick(book.id)}>
                        <div className="carousel-item-info">
                            <h3>{book.title}</h3>
                            <p>{book.author}</p>
                        </div>
                        <img src={book.coverImageUrl} alt={book.title} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
