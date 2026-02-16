"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { subjects } from "@/lib/subjects";

interface Recommendation {
  id: string;
  url: string;
  subjectId: number;
  subjectName: string;
  note?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface Resource {
  url: string;
  addedAt: string;
}

interface BookRecommendation {
  id: string;
  title: string;
  url: string;
  categoryId: string;
  categoryName: string;
  note?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface ReadingListCategoryOption {
  id: string;
  name: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<{
    pending: Recommendation[];
    approved: Recommendation[];
    rejected: Recommendation[];
  }>({ pending: [], approved: [], rejected: [] });
  const [bookRecommendations, setBookRecommendations] = useState<{
    pending: BookRecommendation[];
    approved: BookRecommendation[];
    rejected: BookRecommendation[];
  }>({ pending: [], approved: [], rejected: [] });
  const [readingListCategories, setReadingListCategories] = useState<
    ReadingListCategoryOption[]
  >([]);
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [loading, setLoading] = useState(true);
  const [newTopicName, setNewTopicName] = useState("");
  const [newResource, setNewResource] = useState({ subjectId: "", url: "" });
  const [newBook, setNewBook] = useState({
    title: "",
    url: "",
    categoryId: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      const [recsRes, resourcesRes, bookRecsRes, categoriesRes] =
        await Promise.all([
          fetch("/api/admin/recommendations"),
          Promise.all(
            subjects.map(async (subject) => {
              const res = await fetch(`/api/resources/${subject.id}`);
              const data = await res.json();
              return { subjectId: subject.id, resources: data };
            })
          ),
          fetch("/api/admin/book-recommendations"),
          fetch("/api/reading-list/categories"),
        ]);

      const recsData = await recsRes.json();
      setRecommendations(recsData);

      const bookRecsData = await bookRecsRes.json();
      setBookRecommendations(
        bookRecsData.pending !== undefined
          ? bookRecsData
          : { pending: [], approved: [], rejected: [] }
      );

      const categoriesData = await categoriesRes.json();
      setReadingListCategories(Array.isArray(categoriesData) ? categoriesData : []);

      const resourcesMap: Record<string, Resource[]> = {};
      for (const item of resourcesRes) {
        resourcesMap[item.subjectId] = item.resources || [];
      }
      setResources(resourcesMap);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch("/api/admin/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", recommendationId }),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Error approving recommendation:", error);
    }
  };

  const handleRejectRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch("/api/admin/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", recommendationId }),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Error rejecting recommendation:", error);
    }
  };

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
        window.location.reload(); // Reload to get updated subjects
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

  const handleAddResource = async () => {
    if (!newResource.subjectId || !newResource.url) return;

    try {
      const response = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResource),
      });

      if (response.ok) {
        setNewResource({ subjectId: "", url: "" });
        await loadData();
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const handleDeleteResource = async (subjectId: number, url: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const response = await fetch(
        `/api/admin/resources?subjectId=${subjectId}&url=${encodeURIComponent(url)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleApproveBookRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch("/api/admin/book-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", recommendationId }),
      });
      if (response.ok) await loadData();
    } catch (error) {
      console.error("Error approving book recommendation:", error);
    }
  };

  const handleRejectBookRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch("/api/admin/book-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", recommendationId }),
      });
      if (response.ok) await loadData();
    } catch (error) {
      console.error("Error rejecting book recommendation:", error);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title.trim() || !newBook.categoryId) return;
    try {
      const response = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addBook",
          categoryId: newBook.categoryId,
          title: newBook.title.trim(),
          url: newBook.url.trim() || undefined,
        }),
      });
      if (response.ok) {
        setNewBook({ title: "", url: "", categoryId: "" });
        await loadData();
      }
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="bg-white min-h-screen p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-normal text-black mb-8">Admin Panel</h1>

        {/* Recommendations Section */}
        <section className="mb-12">
          <h2 className="text-xl font-normal text-black mb-4">Pending Recommendations</h2>
          {recommendations.pending?.length === 0 ? (
            <p className="text-gray-600">No pending recommendations</p>
          ) : (
            <div className="space-y-4">
              {recommendations.pending?.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={rec.url}
                        className="block truncate text-blue-600 hover:underline cursor-pointer"
                      >
                        {rec.url}
                      </a>
                      <p className="text-sm text-gray-600 mt-1">Topic: {rec.subjectName}</p>
                      {rec.note && (
                        <p className="text-sm text-gray-600 mt-1">Note: {rec.note}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRecommendation(rec.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRecommendation(rec.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reading List Section */}
        <section className="mb-12">
          <h2 className="text-xl font-normal text-black mb-4">Reading List</h2>
          <p className="text-gray-600 text-sm mb-4">
            <a
              href="/reading-list"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Manage Reading List
            </a>{" "}
            — add books, check off Next / Currently Reading.
          </p>
          <div className="mb-4 p-4 border border-gray-200 rounded">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add Book</h4>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newBook.title}
                onChange={(e) =>
                  setNewBook((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Book title"
                className="px-3 py-2 border border-gray-300 rounded text-black"
              />
              <input
                type="url"
                value={newBook.url}
                onChange={(e) =>
                  setNewBook((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="URL (optional)"
                className="px-3 py-2 border border-gray-300 rounded text-black"
              />
              <select
                value={newBook.categoryId}
                onChange={(e) =>
                  setNewBook((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded text-black"
              >
                <option value="">Select category</option>
                {readingListCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddBook}
                disabled={!newBook.title.trim() || !newBook.categoryId}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add Book
              </button>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Pending Book Recommendations
          </h4>
          {!bookRecommendations.pending?.length ? (
            <p className="text-gray-600 text-sm">No pending book recommendations</p>
          ) : (
            <div className="space-y-4">
              {bookRecommendations.pending.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-blue-600 hover:underline cursor-pointer"
                      >
                        {rec.title}
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        Category: {rec.categoryName}
                      </p>
                      {rec.note && (
                        <p className="text-sm text-gray-600 mt-1">
                          Note: {rec.note}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveBookRecommendation(rec.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectBookRecommendation(rec.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add Topic Section */}
        <section className="mb-12">
          <h2 className="text-xl font-normal text-black mb-4">Add New Topic</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-black"
            />
            <button
              onClick={handleAddTopic}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
            >
              Add Topic
            </button>
          </div>
        </section>

        {/* Topics Section */}
        <section>
          <h2 className="text-xl font-normal text-black mb-4">Topics</h2>
          <div className="space-y-8">
            {subjects.map((subject) => (
              <div key={subject.id} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-normal text-black">{subject.name}</h3>
                  <button
                    onClick={() => handleDeleteTopic(subject.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 cursor-pointer"
                  >
                    Delete Topic
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add Resource</h4>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newResource.subjectId === subject.id.toString() ? newResource.url : ""}
                      onChange={(e) =>
                        setNewResource({ subjectId: subject.id.toString(), url: e.target.value })
                      }
                      placeholder="https://example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <button
                      onClick={handleAddResource}
                      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  {resources[subject.id]?.length === 0 ? (
                    <p className="text-gray-600 text-sm">No resources</p>
                  ) : (
                    <ul className="space-y-1">
                      {resources[subject.id]?.map((resource, index) => (
                        <li key={index} className="flex justify-between items-center gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={resource.url}
                            className="min-w-0 truncate text-blue-600 hover:underline text-sm cursor-pointer"
                          >
                            {resource.url}
                          </a>
                          <button
                            onClick={() => handleDeleteResource(subject.id, resource.url)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 cursor-pointer"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
