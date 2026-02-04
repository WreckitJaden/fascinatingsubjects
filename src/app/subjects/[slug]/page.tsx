"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getSubjectBySlug } from "@/lib/subjects";
import AddResourceForm from "@/components/AddResourceForm";
import { RESOURCE_CATEGORIES, DEFAULT_RESOURCE_CATEGORY } from "@/lib/resource-categories";
import type { ResourceCategory } from "@/lib/resource-categories";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Resource {
  url: string;
  addedAt: string;
  explored?: boolean;
  category?: ResourceCategory;
}

export default function SubjectPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>("");
  const [subject, setSubject] = useState<ReturnType<typeof getSubjectBySlug> | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [exploredResources, setExploredResources] = useState<Resource[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const subjectData = getSubjectBySlug(resolvedParams.slug);
      setSubject(subjectData);

      if (subjectData) {
        try {
          const response = await fetch(`/api/resources/${subjectData.id}`);
          if (response.ok) {
            const data = await response.json();
            const allResources: Resource[] = data || [];
            const active = allResources.filter((r) => !r.explored);
            const explored = allResources.filter((r) => r.explored);
            setResources(active);
            setExploredResources(explored);
          }
        } catch (error) {
          console.error("Error loading resources:", error);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params]);

  const handleToggleSelect = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedUrls(newSelected);
  };

  const handleMarkAsExplored = async () => {
    if (selectedUrls.size === 0 || !subject) return;

    try {
      const response = await fetch("/api/resources/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          urls: Array.from(selectedUrls),
        }),
      });

      if (response.ok) {
        // Reload resources
        const resResponse = await fetch(`/api/resources/${subject.id}`);
        if (resResponse.ok) {
          const data = await resResponse.json();
          const allResources: Resource[] = data || [];
          const active = allResources.filter((r) => !r.explored);
          const explored = allResources.filter((r) => r.explored);
          setResources(active);
          setExploredResources(explored);
        }
        setSelectedUrls(new Set());
      }
    } catch (error) {
      console.error("Error marking as explored:", error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUrls.size === 0 || !subject) return;
    if (!confirm(`Are you sure you want to delete ${selectedUrls.size} resource(s)?`)) return;

    try {
      const deletePromises = Array.from(selectedUrls).map((url) =>
        fetch(
          `/api/admin/resources?subjectId=${subject.id}&url=${encodeURIComponent(url)}`,
          { method: "DELETE" }
        )
      );

      await Promise.all(deletePromises);

      // Reload resources
      const resResponse = await fetch(`/api/resources/${subject.id}`);
      if (resResponse.ok) {
        const data = await resResponse.json();
        const allResources: Resource[] = data || [];
        const active = allResources.filter((r) => !r.explored);
        const explored = allResources.filter((r) => r.explored);
        setResources(active);
        setExploredResources(explored);
      }
      setSelectedUrls(new Set());
    } catch (error) {
      console.error("Error deleting resources:", error);
    }
  };

  const handleDeleteTopic = async () => {
    if (!subject) return;
    if (!confirm("Are you sure you want to delete this entire topic?")) return;

    try {
      const response = await fetch(`/api/admin/subjects?id=${subject.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="bg-white min-h-screen p-6">
        <p>Topic not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block cursor-pointer"
          >
            ← Back
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-normal text-black">{subject.name}</h1>
              {subject.description && (
                <p className="text-sm text-gray-500 mt-2">{subject.description}</p>
              )}
            </div>
            {session && (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {isEditMode ? "Done" : "Edit"}
                </button>
                {isEditMode && (
                  <button
                    onClick={handleDeleteTopic}
                    className="text-sm text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                  >
                    Delete Topic
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {session && (
          <div className="mb-8">
            <AddResourceForm subjectId={subject.id} />
          </div>
        )}

        {isEditMode && selectedUrls.size > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded flex gap-2">
            <button
              onClick={handleMarkAsExplored}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            >
              Mark as Explored ({selectedUrls.size})
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Delete Selected ({selectedUrls.size})
            </button>
          </div>
        )}

        <div className="mb-8">
          {resources.length === 0 ? (
            <p className="text-gray-600">No resources yet.</p>
          ) : (
            <div className="space-y-8">
              {RESOURCE_CATEGORIES.map((cat) => {
                const inCategory = resources.filter(
                  (r) => (r.category || DEFAULT_RESOURCE_CATEGORY) === cat.value
                );
                if (inCategory.length === 0) return null;
                return (
                  <div key={cat.value}>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">{cat.label}</h3>
                    <ul className="space-y-2">
                      {inCategory.map((resource, index) => (
                        <li key={`${resource.url}-${index}`} className="flex items-center gap-2">
                          {isEditMode && (
                            <input
                              type="checkbox"
                              checked={selectedUrls.has(resource.url)}
                              onChange={() => handleToggleSelect(resource.url)}
                              className="cursor-pointer"
                            />
                          )}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={resource.url}
                            className="min-w-0 truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {resource.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {exploredResources.length > 0 && (
          <div>
            <h2 className="text-xl font-normal text-black mb-4">Explored</h2>
            <div className="space-y-8">
              {RESOURCE_CATEGORIES.map((cat) => {
                const inCategory = exploredResources.filter(
                  (r) => (r.category || DEFAULT_RESOURCE_CATEGORY) === cat.value
                );
                if (inCategory.length === 0) return null;
                return (
                  <div key={cat.value}>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">{cat.label}</h3>
                    <ul className="space-y-2">
                      {inCategory.map((resource, index) => (
                        <li key={`${resource.url}-${index}`} className="flex items-center gap-2">
                          {isEditMode && (
                            <input
                              type="checkbox"
                              checked={selectedUrls.has(resource.url)}
                              onChange={() => handleToggleSelect(resource.url)}
                              className="cursor-pointer"
                            />
                          )}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={resource.url}
                            className="min-w-0 truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer line-through text-gray-500"
                          >
                            {resource.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
