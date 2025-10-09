import { useQuery } from '@tanstack/react-query';
import type { Book } from '../types/Book';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async (): Promise<Book[]> => {
      const res = await fetch('https://localhost:7101/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json();
    },
  });
};

export const useBook = (id: string | undefined) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async (): Promise<Book> => {
      const res = await fetch(`https://localhost:7101/books/${id}`);
      if (!res.ok) throw new Error('Failed to fetch book');
      return res.json();
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual books
  });
};

export const useBookDescription = (openLibraryId: string | undefined) => {
  return useQuery({
    queryKey: ['description', openLibraryId],
    queryFn: async (): Promise<string> => {
      const res = await fetch(`https://openlibrary.org/works/${openLibraryId}.json`);
      if (!res.ok) throw new Error('Failed to fetch description');
      
      const data = await res.json();
      if (data.description) {
        return typeof data.description === 'string' 
          ? data.description 
          : data.description.value;
      }
      throw new Error('Description not available');
    },
    enabled: !!openLibraryId,
    staleTime: 60 * 60 * 1000, // 1 hour for descriptions (they change rarely)
    retry: 1, // Only retry once for external API
  });
};