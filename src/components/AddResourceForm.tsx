"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RESOURCE_CATEGORIES, DEFAULT_RESOURCE_CATEGORY } from "@/lib/resource-categories";
import type { ResourceCategory } from "@/lib/resource-categories";

interface AddResourceFormProps {
  subjectId: number;
}

export default function AddResourceForm({ subjectId }: AddResourceFormProps) {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ResourceCategory>(DEFAULT_RESOURCE_CATEGORY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/resources/${subjectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add resource");
      }

      setMessage({ type: "success", text: "Resource added successfully!" });
      setUrl("");
      setCategory(DEFAULT_RESOURCE_CATEGORY);
      // Refresh the page to show the new resource
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to add resource" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-black"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
            className="px-3 py-2 border border-gray-300 rounded text-black min-w-[180px]"
            aria-label="Category"
          >
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
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
      </form>
    </div>
  );
}
