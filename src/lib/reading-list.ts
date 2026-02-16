export interface ReadingListBook {
  id: string;
  title: string;
  url: string;
}

export interface ReadingListCategory {
  id: string;
  name: string;
  books: ReadingListBook[];
}

export interface ReadingListData {
  categories: ReadingListCategory[];
  next: string[];
  currentlyReading: string[];
}

export interface BookRecommendation {
  id: string;
  title: string;
  url: string;
  categoryId: string;
  categoryName: string;
  note?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export function findBookById(
  data: ReadingListData,
  bookId: string
): { book: ReadingListBook; categoryId: string } | null {
  for (const cat of data.categories) {
    const book = cat.books.find((b) => b.id === bookId);
    if (book) return { book, categoryId: cat.id };
  }
  return null;
}
