"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { subjects } from "@/lib/subjects";

export default function Home() {
  const { data: session } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const response = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopicName }),
      });

      if (response.ok) {
        setNewTopicName("");
        setShowAddTopic(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleDeleteTopic = async (subjectId: number) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      const response = await fetch(`/api/admin/subjects?id=${subjectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {session && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              {isEditMode ? "Done Editing" : "Edit"}
            </button>
            {isEditMode && (
              <button
                onClick={() => setShowAddTopic(!showAddTopic)}
                className="text-sm text-green-600 hover:text-green-800 hover:underline cursor-pointer"
              >
                + Add Topic
              </button>
            )}
          </div>
        )}

        {showAddTopic && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name"
              className="w-full px-3 py-2 border border-gray-300 rounded text-black mb-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTopic();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddTopic}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddTopic(false);
                  setNewTopicName("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <nav>
          <ul className="space-y-1">
            {subjects.map((subject) => (
              <li key={subject.id} className="flex items-center gap-2">
                <Link
                  href={`/subjects/${subject.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex-1"
                >
                  {subject.name}
                </Link>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteTopic(subject.id)}
                    className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
