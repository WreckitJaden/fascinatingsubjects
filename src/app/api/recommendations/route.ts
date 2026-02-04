import { NextRequest, NextResponse } from "next/server";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";
import { getSubjectById } from "@/lib/subjects";
import { randomUUID } from "crypto";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, url, note, category } = body;

    if (!subjectId || !url) {
      return NextResponse.json(
        { error: "Subject ID and URL are required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Get subject name
    const subject = getSubjectById(subjectId);
    if (!subject) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
    }

    // Read existing recommendations
    const recommendations = await readJsonFromGitHub<{
      pending: Recommendation[];
      approved: Recommendation[];
      rejected: Recommendation[];
    }>("data/recommendations.json");

    // Check if URL already exists in pending or approved
    const allRecommendations = [
      ...(recommendations.pending || []),
      ...(recommendations.approved || []),
    ];
    if (allRecommendations.some((r) => r.url === url)) {
      return NextResponse.json(
        { error: "This URL has already been recommended" },
        { status: 400 }
      );
    }

    const validCategories = ["general-learning", "peer-reviewed-papers", "research-databases"];
    const recommendationCategory =
      category && validCategories.includes(category) ? category : undefined;

    // Create new recommendation
    const recommendation: Recommendation = {
      id: randomUUID(),
      url,
      subjectId,
      subjectName: subject.name,
      note: note || undefined,
      category: recommendationCategory,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    // Add to pending
    const updatedRecommendations = {
      pending: [...(recommendations.pending || []), recommendation],
      approved: recommendations.approved || [],
      rejected: recommendations.rejected || [],
    };

    // Save to GitHub
    await writeJsonToGitHub(
      "data/recommendations.json",
      updatedRecommendations,
      `Add recommendation: ${url} for ${subject.name}`
    );

    return NextResponse.json({ success: true, id: recommendation.id });
  } catch (error: any) {
    console.error("Error processing recommendation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process recommendation" },
      { status: 500 }
    );
  }
}
