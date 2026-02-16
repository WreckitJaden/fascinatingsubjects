"use client";

import { useState, useEffect } from "react";

interface CategoryOption {
  id: string;
  name: string;
}

interface RecommendBookFormProps {
  onClose?: () => void;
}

export default function RecommendBookForm({ onClose }: RecommendBookFormProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/reading-list/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!url.trim() || !categoryId) {
      setMessage({
        type: "error",
        text: "Please enter a link and select a category",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/book-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          categoryId,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit recommendation");
      }

      setMessage({
        type: "success",
        text: "Thank you! Your book recommendation has been submitted.",
      });
      setUrl("");
      setCategoryId("");
      setNote("");
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit recommendation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded">
      <h2 className="text-xl font-normal text-black mb-4">Recommend a Book</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="book-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Link
          </label>
          <input
            id="book-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            required
          />
        </div>
        <div>
          <label
            htmlFor="book-category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="book-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            required
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="book-note"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Why do you recommend? (optional)
          </label>
          <textarea
            id="book-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why you recommend it..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
          />
        </div>
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : "Submit Recommendation"}
        </button>
      </form>
    </div>
  );
}
