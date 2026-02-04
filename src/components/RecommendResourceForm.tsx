"use client";

import { useState } from "react";
import { subjects } from "@/lib/subjects";

interface RecommendResourceFormProps {
  onClose?: () => void;
}

export default function RecommendResourceForm({ onClose }: RecommendResourceFormProps) {
  const [subjectId, setSubjectId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!subjectId || !url) {
      setMessage({ type: "error", text: "Please select a topic and enter a URL" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: parseInt(subjectId),
          url,
          note: note || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit recommendation");
      }

      setMessage({
        type: "success",
        text: "Thank you! Your recommendation has been submitted.",
      });
      setUrl("");
      setNote("");
      setSubjectId("");
      // Close form after successful submission
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to submit recommendation" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded">
      <h2 className="text-xl font-normal text-black mb-4">Recommend a Resource</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            required
          >
            <option value="">Select a topic...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional context..."
            rows={3}
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
