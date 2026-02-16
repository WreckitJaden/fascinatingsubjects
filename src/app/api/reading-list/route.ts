import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { readReadingListData, writeReadingListData } from "@/lib/reading-list-data";
import {
  type ReadingListData,
  type ReadingListBook,
  findBookById,
} from "@/lib/reading-list";
import { randomUUID } from "crypto";

function defaultData(): ReadingListData {
  return { categories: [], next: [], currentlyReading: [] };
}

export async function GET() {
  try {
    const data = await readReadingListData();
    const list = data.categories?.length ? data : defaultData();

    // Resolve next and currentlyReading to full book objects
    const nextBooks: ReadingListBook[] = [];
    const currentlyReadingBooks: ReadingListBook[] = [];
    for (const id of list.next || []) {
      const found = findBookById(list, id);
      if (found) nextBooks.push(found.book);
    }
    for (const id of list.currentlyReading || []) {
      const found = findBookById(list, id);
      if (found) currentlyReadingBooks.push(found.book);
    }

    return NextResponse.json({
      categories: list.categories,
      next: nextBooks,
      currentlyReading: currentlyReadingBooks,
      nextIds: list.next || [],
      currentlyReadingIds: list.currentlyReading || [],
    });
  } catch (error: unknown) {
    console.error("Error fetching reading list:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading list" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;
    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let data = await readReadingListData();
    if (!data.categories?.length) {
      data = defaultData();
    }

    switch (action) {
      case "addBook": {
        const { categoryId, title, url } = body;
        if (!categoryId || !title) {
          return NextResponse.json(
            { error: "categoryId and title are required" },
            { status: 400 }
          );
        }
        const cat = data.categories.find((c) => c.id === categoryId);
        if (!cat) {
          return NextResponse.json(
            { error: "Category not found" },
            { status: 404 }
          );
        }
        const book: ReadingListBook = {
          id: randomUUID(),
          title: title.trim(),
          url: (url || "").trim(),
        };
        cat.books = cat.books || [];
        cat.books.push(book);
        await writeReadingListData(
          data,
          `Add book: ${book.title} to ${cat.name}`
        );
        return NextResponse.json({ success: true, bookId: book.id });
      }

      case "removeFromNext": {
        const { bookId } = body;
        if (!bookId) {
          return NextResponse.json(
            { error: "bookId is required" },
            { status: 400 }
          );
        }
        data.next = (data.next || []).filter((id) => id !== bookId);
        await writeReadingListData(
          data,
          `Remove book from Next: ${bookId}`
        );
        return NextResponse.json({ success: true });
      }

      case "removeFromCurrentlyReading": {
        const { bookId } = body;
        if (!bookId) {
          return NextResponse.json(
            { error: "bookId is required" },
            { status: 400 }
          );
        }
        data.currentlyReading = (data.currentlyReading || []).filter(
          (id) => id !== bookId
        );
        await writeReadingListData(
          data,
          `Remove book from Currently Reading: ${bookId}`
        );
        return NextResponse.json({ success: true });
      }

      case "setNext": {
        const { bookIds } = body;
        if (!Array.isArray(bookIds)) {
          return NextResponse.json(
            { error: "bookIds array is required" },
            { status: 400 }
          );
        }
        data.next = bookIds;
        await writeReadingListData(data, "Update Next list");
        return NextResponse.json({ success: true });
      }

      case "setCurrentlyReading": {
        const { bookIds } = body;
        if (!Array.isArray(bookIds)) {
          return NextResponse.json(
            { error: "bookIds array is required" },
            { status: 400 }
          );
        }
        data.currentlyReading = bookIds;
        await writeReadingListData(
          data,
          "Update Currently Reading list"
        );
        return NextResponse.json({ success: true });
      }

      case "addToNext": {
        const { bookId } = body;
        if (!bookId) {
          return NextResponse.json(
            { error: "bookId is required" },
            { status: 400 }
          );
        }
        data.next = data.next || [];
        if (!data.next.includes(bookId)) {
          data.next.push(bookId);
        }
        await writeReadingListData(data, `Add book to Next: ${bookId}`);
        return NextResponse.json({ success: true });
      }

      case "addToCurrentlyReading": {
        const { bookId } = body;
        if (!bookId) {
          return NextResponse.json(
            { error: "bookId is required" },
            { status: 400 }
          );
        }
        data.currentlyReading = data.currentlyReading || [];
        if (!data.currentlyReading.includes(bookId)) {
          data.currentlyReading.push(bookId);
        }
        await writeReadingListData(
          data,
          `Add book to Currently Reading: ${bookId}`
        );
        return NextResponse.json({ success: true });
      }

      case "deleteBook": {
        const { bookId } = body;
        if (!bookId) {
          return NextResponse.json(
            { error: "bookId is required" },
            { status: 400 }
          );
        }
        for (const cat of data.categories) {
          cat.books = (cat.books || []).filter((b) => b.id !== bookId);
        }
        data.next = (data.next || []).filter((id) => id !== bookId);
        data.currentlyReading = (data.currentlyReading || []).filter(
          (id) => id !== bookId
        );
        await writeReadingListData(data, `Delete book: ${bookId}`);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Error updating reading list:", error);
    return NextResponse.json(
      { error: "Failed to update reading list" },
      { status: 500 }
    );
  }
}
