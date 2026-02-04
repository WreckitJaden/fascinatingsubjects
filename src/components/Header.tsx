"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import RecommendResourceForm from "./RecommendResourceForm";

export default function Header() {
  const { data: session, status } = useSession();
  const [showRecommendForm, setShowRecommendForm] = useState(false);

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-normal text-black hover:underline cursor-pointer">
              Topics to Study
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRecommendForm(!showRecommendForm)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Recommend a Resource
              </button>
              {status === "loading" ? null : session ? (
                <>
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
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-6">
            <RecommendResourceForm />
          </div>
        </div>
      )}
    </>
  );
}
