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

const MAX_NEXT = 4;
const MAX_CURRENTLY_READING = 1;

function BookCell({
  book,
  showDone,
  onDone,
  doneLabel = "Done",
  onMoveToCurrentlyReading,
  moveToCurrentlyReadingDisabled,
}: {
  book: ReadingListBook;
  showDone?: boolean;
  onDone?: () => void;
  doneLabel?: string;
  onMoveToCurrentlyReading?: () => void;
  moveToCurrentlyReadingDisabled?: boolean;
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
  const showMoveToCR = onMoveToCurrentlyReading !== undefined;
  const hasActions = (showDone && onDone) || showMoveToCR;
  return (
    <tr>
      <td className="py-2 pr-4 align-top">{content}</td>
      {hasActions && (
        <td className="py-2 align-top">
          <div className="flex flex-wrap gap-1">
            {showMoveToCR && (
              <button
                onClick={onMoveToCurrentlyReading}
                disabled={moveToCurrentlyReadingDisabled}
                title={moveToCurrentlyReadingDisabled ? "Finish current book first (max 1)" : undefined}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move to Currently Reading
              </button>
            )}
            {showDone && onDone && (
              <button
                onClick={onDone}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
              >
                {doneLabel}
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
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

  const handleMoveToCurrentlyReading = async (bookId: string) => {
    try {
      const [removeRes, addRes] = await Promise.all([
        fetch("/api/reading-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "removeFromNext", bookId }),
        }),
        fetch("/api/reading-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "addToCurrentlyReading", bookId }),
        }),
      ]);
      if (removeRes.ok && addRes.ok) await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToNext = async (bookId: string) => {
    try {
      const res = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addToNext", bookId }),
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
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            ← Back
          </Link>
          {session && (
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
            >
              Manage in Admin
            </Link>
          )}
        </div>

        <div className="mb-10 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Currently Reading
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-600 py-1 pr-4">Book</th>
                    {session && (
                      <th className="text-left text-sm font-medium text-gray-600 py-1">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.currentlyReading.length === 0 ? (
                    <tr>
                      <td colSpan={session ? 2 : 1} className="py-2 text-gray-500 text-sm">
                        None
                      </td>
                    </tr>
                  ) : (
                    data.currentlyReading.map((book) => (
                      <BookCell
                        key={book.id}
                        book={book}
                        showDone={!!session}
                        onDone={() => handleRemoveFromCurrentlyReading(book.id)}
                        doneLabel="Done"
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Next
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-600 py-1 pr-4">Book</th>
                    {session && (
                      <th className="text-left text-sm font-medium text-gray-600 py-1">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.next.length === 0 ? (
                    <tr>
                      <td colSpan={session ? 2 : 1} className="py-2 text-gray-500 text-sm">
                        None
                      </td>
                    </tr>
                  ) : (
                    data.next.map((book) => (
                      <BookCell
                        key={book.id}
                        book={book}
                        showDone={!!session}
                        onDone={() => handleRemoveFromNext(book.id)}
                        onMoveToCurrentlyReading={session ? () => handleMoveToCurrentlyReading(book.id) : undefined}
                        moveToCurrentlyReadingDisabled={data.currentlyReading.length >= MAX_CURRENTLY_READING}
                        doneLabel="Done"
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                    <li key={book.id} className="flex items-center gap-2 flex-wrap">
                      {book.url ? (
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
                      )}
                      {session && (
                        <button
                          onClick={() => handleAddToNext(book.id)}
                          disabled={data.next.length >= MAX_NEXT}
                          title={data.next.length >= MAX_NEXT ? `Next list is full (max ${MAX_NEXT})` : undefined}
                          className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Next
                        </button>
                      )}
                    </li>
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
