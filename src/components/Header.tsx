"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import RecommendResourceForm from "./RecommendResourceForm";
import RecommendBookForm from "./RecommendBookForm";

export default function Header() {
  const { data: session, status } = useSession();
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [showRecommendBookForm, setShowRecommendBookForm] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (!session) {
      setPendingCount(0);
      return;
    }
    async function fetchPendingCount() {
      try {
        const res = await fetch("/api/admin/recommendations");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pending?.length ?? 0);
        }
      } catch {
        setPendingCount(0);
      }
    }
    fetchPendingCount();
  }, [session]);

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-normal text-black hover:underline cursor-pointer">
              Topics to Study
            </Link>
            <div className="flex items-center gap-4">
              {!session && (
                <>
                  <button
                    onClick={() => setShowRecommendForm(!showRecommendForm)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Recommend a Resource
                  </button>
                  <button
                    onClick={() => setShowRecommendBookForm(!showRecommendBookForm)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Recommend a Book
                  </button>
                </>
              )}
              {status === "loading" ? null : session ? (
                <>
                  <Link
                    href="/recommendations"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {pendingCount > 0
                      ? `Recommendations (${pendingCount})`
                      : "Recommendations"}
                  </Link>
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
                  >
                    Admin
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {showRecommendForm && (
        <div className="border-b border-gray-200 bg-white relative">
          <div className="mx-auto max-w-4xl px-6 py-6">
            <button
              onClick={() => setShowRecommendForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <RecommendResourceForm onClose={() => setShowRecommendForm(false)} />
          </div>
        </div>
      )}
      {showRecommendBookForm && (
        <div className="border-b border-gray-200 bg-white relative">
          <div className="mx-auto max-w-4xl px-6 py-6">
            <button
              onClick={() => setShowRecommendBookForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <RecommendBookForm onClose={() => setShowRecommendBookForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}
