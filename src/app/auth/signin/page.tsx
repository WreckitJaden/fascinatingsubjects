"use client";

import { signIn as nextAuthSignIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    try {
      const result = await nextAuthSignIn("credentials", {
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(true);
      } else if (result?.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full space-y-8">
          <p className="text-red-100 text-xl font-semibold tracking-tight">
            What are you doing?
          </p>
          <p className="text-red-200/90 text-lg">
            Nothing to see here. Out of bounds. Run along.
          </p>
          <Link
            href="/auth/signin"
            onClick={(e) => {
              e.preventDefault();
              setError(false);
            }}
            className="inline-block px-6 py-3 border-2 border-red-700 text-red-100 rounded font-medium hover:bg-red-900/50 transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <h1 className="text-2xl font-normal text-black mb-8">Sign In</h1>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
