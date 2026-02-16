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

function BookTitle({ book, isEditMode }: { book: ReadingListBook; isEditMode: boolean }) {
  if (isEditMode) {
    return <span className="text-gray-900">{book.title}</span>;
  }
  if (book.url) {
    return (
      <a
        href={book.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
      >
        {book.title}
      </a>
    );
  }
  return <span className="text-gray-700">{book.title}</span>;
}

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

function iconButtonClass() {
  return "p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent";
}

export default function ReadingListPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReadingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

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

  const handleDeleteBook = async (bookId: string) => {
    try {
      const res = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteBook", bookId }),
      });
      if (res.ok) {
        setSelectedBookId((id) => (id === bookId ? null : id));
        await load();
      }
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
        <div className="mb-8 flex items-center justify-between flex-wrap gap-2">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-4">
            {session && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode((e) => !e);
                    setSelectedBookId(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
                >
                  {isEditMode ? "Done" : "Edit"}
                </button>
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
                >
                  Manage in Admin
                </Link>
              </>
            )}
          </div>
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
                    {session && isEditMode && (
                      <th className="text-left text-sm font-medium text-gray-600 py-1 w-12" aria-hidden />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.currentlyReading.length === 0 ? (
                    <tr>
                      <td colSpan={session && isEditMode ? 2 : 1} className="py-2 text-gray-500 text-sm">
                        None
                      </td>
                    </tr>
                  ) : (
                    data.currentlyReading.map((book) => {
                      const selected = session && isEditMode && selectedBookId === book.id;
                      return (
                        <tr
                          key={book.id}
                          onClick={() => session && isEditMode && setSelectedBookId((id) => (id === book.id ? null : book.id))}
                          className={`py-2 ${session && isEditMode ? "cursor-pointer hover:bg-gray-100" : ""} ${selected ? "bg-gray-200" : ""}`}
                        >
                          <td className="py-2 pr-4 align-top">
                            <BookTitle book={book} isEditMode={!!(session && isEditMode)} />
                          </td>
                          {session && isEditMode && (
                            <td className="py-2 align-top w-12">
                              {selected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFromCurrentlyReading(book.id);
                                  }}
                                  title="Mark done"
                                  className={iconButtonClass()}
                                >
                                  <IconCheck />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
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
                    {session && isEditMode && (
                      <th className="text-left text-sm font-medium text-gray-600 py-1 w-24" aria-hidden />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.next.length === 0 ? (
                    <tr>
                      <td colSpan={session && isEditMode ? 2 : 1} className="py-2 text-gray-500 text-sm">
                        None
                      </td>
                    </tr>
                  ) : (
                    data.next.map((book) => {
                      const selected = session && isEditMode && selectedBookId === book.id;
                      const crFull = data.currentlyReading.length >= MAX_CURRENTLY_READING;
                      return (
                        <tr
                          key={book.id}
                          onClick={() => session && isEditMode && setSelectedBookId((id) => (id === book.id ? null : book.id))}
                          className={`py-2 ${session && isEditMode ? "cursor-pointer hover:bg-gray-100" : ""} ${selected ? "bg-gray-200" : ""}`}
                        >
                          <td className="py-2 pr-4 align-top">
                            <BookTitle book={book} isEditMode={!!(session && isEditMode)} />
                          </td>
                          {session && isEditMode && (
                            <td className="py-2 align-top">
                              {selected && (
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFromNext(book.id);
                                    }}
                                    title="Remove from Next"
                                    className={iconButtonClass()}
                                  >
                                    <IconX />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveToCurrentlyReading(book.id);
                                    }}
                                    disabled={crFull}
                                    title={crFull ? "Finish current book first (max 1)" : "Move to Currently Reading"}
                                    className={iconButtonClass()}
                                  >
                                    <IconArrowRight />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
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
                <ul className="space-y-1 list-none pl-0">
                  {category.books.map((book) => {
                    const selected = session && isEditMode && selectedBookId === book.id;
                    const nextFull = data.next.length >= MAX_NEXT;
                    return (
                      <li
                        key={book.id}
                        onClick={() => session && isEditMode && setSelectedBookId((id) => (id === book.id ? null : book.id))}
                        className={`flex items-center gap-2 flex-wrap py-1.5 px-2 -mx-2 rounded ${session && isEditMode ? "cursor-pointer hover:bg-gray-100" : ""} ${selected ? "bg-gray-200" : ""}`}
                      >
                        <BookTitle book={book} isEditMode={!!(session && isEditMode)} />
                        {session && isEditMode && selected && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDeleteBook(book.id)}
                              title="Delete book"
                              className={iconButtonClass()}
                            >
                              <IconX />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddToNext(book.id)}
                              disabled={nextFull}
                              title={nextFull ? `Next list is full (max ${MAX_NEXT})` : "Add to Next"}
                              className="px-2 py-1 text-xs rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
