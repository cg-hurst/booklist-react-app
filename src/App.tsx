import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookPage from './pages/BookPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<BookPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;