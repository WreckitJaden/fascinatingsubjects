import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";
import { readJsonFromGitHub as readResourcesJson, writeJsonToGitHub as writeResourcesJson } from "@/lib/github";
import { DEFAULT_RESOURCE_CATEGORY } from "@/lib/resources";
import type { ResourceCategory } from "@/lib/resources";

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

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const recommendations = await readJsonFromGitHub<{
      pending: Recommendation[];
      approved: Recommendation[];
      rejected: Recommendation[];
    }>("data/recommendations.json");

    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, recommendationId } = body;

    if (!action || !recommendationId) {
      return NextResponse.json(
        { error: "Action and recommendation ID are required" },
        { status: 400 }
      );
    }

    // Read recommendations
    const recommendations = await readJsonFromGitHub<{
      pending: Recommendation[];
      approved: Recommendation[];
      rejected: Recommendation[];
    }>("data/recommendations.json");

    // Find the recommendation
    const recommendation = recommendations.pending?.find((r) => r.id === recommendationId);

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Move to approved and add to resources
      const updatedRecommendations = {
        pending: recommendations.pending.filter((r) => r.id !== recommendationId),
        approved: [
          ...(recommendations.approved || []),
          { ...recommendation, status: "approved" as const },
        ],
        rejected: recommendations.rejected || [],
      };

      // Read and update resources
      const resources = await readResourcesJson<
        Record<string, Array<{ url: string; addedAt: string; category?: ResourceCategory }>>
      >("data/resources.json");

      const subjectKey = recommendation.subjectId.toString();
      if (!resources[subjectKey]) {
        resources[subjectKey] = [];
      }

      const validCategories: ResourceCategory[] = ["general-learning", "peer-reviewed-papers", "research-databases"];
      const resourceCategory: ResourceCategory =
        recommendation.category && validCategories.includes(recommendation.category as ResourceCategory)
          ? (recommendation.category as ResourceCategory)
          : DEFAULT_RESOURCE_CATEGORY;

      if (!resources[subjectKey].some((r) => r.url === recommendation.url)) {
        resources[subjectKey].push({
          url: recommendation.url,
          addedAt: new Date().toISOString(),
          category: resourceCategory,
        });

        await writeResourcesJson(
          "data/resources.json",
          resources,
          `Approve recommendation: ${recommendation.url} for ${recommendation.subjectName}`
        );
      }

      await writeJsonToGitHub(
        "data/recommendations.json",
        updatedRecommendations,
        `Approve recommendation: ${recommendation.url}`
      );

      return NextResponse.json({ success: true, message: "Recommendation approved" });
    } else if (action === "reject") {
      // Move to rejected
      const updatedRecommendations = {
        pending: recommendations.pending.filter((r) => r.id !== recommendationId),
        approved: recommendations.approved || [],
        rejected: [
          ...(recommendations.rejected || []),
          { ...recommendation, status: "rejected" as const },
        ],
      };

      await writeJsonToGitHub(
        "data/recommendations.json",
        updatedRecommendations,
        `Reject recommendation: ${recommendation.url}`
      );

      return NextResponse.json({ success: true, message: "Recommendation rejected" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error processing recommendation action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process recommendation" },
      { status: 500 }
    );
  }
}
