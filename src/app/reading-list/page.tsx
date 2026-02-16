"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import type { ReadingListBook, ReadingListCategory } from "@/lib/reading-list";

interface ReadingListResponse {
  categories: ReadingListCategory[];
  next: ReadingListBook[];
  currentlyReading: ReadingListBook[];
  nextIds: string[];
  currentlyReadingIds: string[];
}

function BookItem({
  book,
  showDone,
  onDone,
  doneLabel = "Done",
}: {
  book: ReadingListBook;
  showDone?: boolean;
  onDone?: () => void;
  doneLabel?: string;
}) {
  const content = book.url ? (
    <a
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
    >
      {book.title}
    </a>
  ) : (
    <span className="text-gray-700">{book.title}</span>
  );
  return (
    <li className="flex items-center gap-2">
      {content}
      {showDone && onDone && (
        <button
          onClick={onDone}
          className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
        >
          {doneLabel}
        </button>
      )}
    </li>
  );
}

export default function ReadingListPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReadingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/reading-list");
      if (!res.ok) throw new Error("Failed to load reading list");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemoveFromNext = async (bookId: string) => {
    try {
      const res = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeFromNext", bookId }),
      });
      if (res.ok) await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFromCurrentlyReading = async (bookId: string) => {
    try {
      const res = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeFromCurrentlyReading", bookId }),
      });
      if (res.ok) await load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white min-h-screen p-6">
        <p className="text-red-600">{error || "Failed to load reading list."}</p>
        <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block cursor-pointer"
          >
            ← Back
          </Link>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-2xl font-normal text-black">Reading List</h1>
            {session && (
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
              >
                Manage in Admin
              </Link>
            )}
          </div>
        </div>

        {data.currentlyReading.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-medium text-black mb-3">
              Currently Reading
            </h2>
            <ul className="space-y-2 list-none pl-0">
              {data.currentlyReading.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  showDone={!!session}
                  onDone={() => handleRemoveFromCurrentlyReading(book.id)}
                  doneLabel="Done"
                />
              ))}
            </ul>
          </section>
        )}

        {data.next.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-medium text-black mb-3">Next</h2>
            <ul className="space-y-2 list-none pl-0">
              {data.next.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  showDone={!!session}
                  onDone={() => handleRemoveFromNext(book.id)}
                  doneLabel="Done"
                />
              ))}
            </ul>
          </section>
        )}

        <div className="space-y-10">
          {data.categories.map((category) => (
            <section key={category.id}>
              <h2 className="text-lg font-medium text-black mb-3">
                {category.name}
              </h2>
              {!category.books?.length ? (
                <p className="text-gray-500 text-sm">No books</p>
              ) : (
                <ul className="space-y-2 list-none pl-0">
                  {category.books.map((book) => (
                    <BookItem key={book.id} book={book} />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
