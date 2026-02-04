"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  "general-learning": "General Learning",
  "peer-reviewed-papers": "Peer-Reviewed Papers",
  "research-databases": "Research Databases",
};

interface Recommendation {
  id: string;
  url: string;
  subjectId: number;
  subjectName: string;
  note?: string;
  category?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<{
    pending: Recommendation[];
    approved: Recommendation[];
    rejected: Recommendation[];
  }>({ pending: [], approved: [], rejected: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadRecommendations();
    }
  }, [status, router]);

  const loadRecommendations = async () => {
    try {
      const response = await fetch("/api/admin/recommendations");
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recommendationId: string) => {
    try {
      const response = await fetch("/api/admin/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", recommendationId }),
      });

      if (response.ok) {
        await loadRecommendations();
      }
    } catch (error) {
      console.error("Error approving recommendation:", error);
    }
  };

  const handleReject = async (recommendationId: string) => {
    try {
      const response = await fetch("/api/admin/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", recommendationId }),
      });

      if (response.ok) {
        await loadRecommendations();
      }
    } catch (error) {
      console.error("Error rejecting recommendation:", error);
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block cursor-pointer"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-normal text-black mt-4">Recommendations</h1>
        </div>

        {/* Pending Recommendations */}
        <section className="mb-12">
          <h2 className="text-xl font-normal text-black mb-4">
            Pending ({recommendations.pending?.length || 0})
          </h2>
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
                        className="block truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {rec.url}
                      </a>
                      <p className="text-sm text-gray-600 mt-1">Topic: {rec.subjectName}</p>
                      {rec.category && (
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {CATEGORY_LABELS[rec.category] ?? rec.category}
                        </p>
                      )}
                      {rec.note && (
                        <p className="text-sm text-gray-600 mt-1">Note: {rec.note}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(rec.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(rec.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(rec.id)}
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

        {/* Approved Recommendations */}
        {recommendations.approved && recommendations.approved.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-normal text-black mb-4">
              Approved ({recommendations.approved.length})
            </h2>
            <div className="space-y-2">
              {recommendations.approved.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded p-3 min-w-0">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={rec.url}
                    className="block truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {rec.url}
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Topic: {rec.subjectName}</p>
                  {rec.category && (
                    <p className="text-sm text-gray-600 mt-1">
                      Category: {CATEGORY_LABELS[rec.category] ?? rec.category}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rejected Recommendations */}
        {recommendations.rejected && recommendations.rejected.length > 0 && (
          <section>
            <h2 className="text-xl font-normal text-black mb-4">
              Rejected ({recommendations.rejected.length})
            </h2>
            <div className="space-y-2">
              {recommendations.rejected.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded p-3 min-w-0">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={rec.url}
                    className="block truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {rec.url}
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Topic: {rec.subjectName}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
