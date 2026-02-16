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

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<{
    pending: Recommendation[];
    approved: Recommendation[];
    rejected: Recommendation[];
  }>({ pending: [], approved: [], rejected: [] });
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [loading, setLoading] = useState(true);
  const [newTopicName, setNewTopicName] = useState("");
  const [newResource, setNewResource] = useState({ subjectId: "", url: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      const [recsRes, resourcesRes] = await Promise.all([
        fetch("/api/admin/recommendations"),
        Promise.all(
          subjects.map(async (subject) => {
            const res = await fetch(`/api/resources/${subject.id}`);
            const data = await res.json();
            return { subjectId: subject.id, resources: data };
          })
        ),
      ]);

      const recsData = await recsRes.json();
      setRecommendations(recsData);

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

c        {/* Topics Section */}
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
