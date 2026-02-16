import { NextRequest, NextResponse } from "next/server";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";
import { readReadingListData } from "@/lib/reading-list-data";
import type { BookRecommendation } from "@/lib/reading-list";
import { randomUUID } from "crypto";

const DATA_PATH = "data/book-recommendations.json";

interface BookRecommendationsFile {
  pending: BookRecommendation[];
  approved: BookRecommendation[];
  rejected: BookRecommendation[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, categoryId, note } = body;

    if (!url?.trim()) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const list = await readReadingListData();
    const category = (list.categories || []).find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    let recommendations: BookRecommendationsFile = {
      pending: [],
      approved: [],
      rejected: [],
    };
    try {
      recommendations = await readJsonFromGitHub<BookRecommendationsFile>(
        DATA_PATH
      );
    } catch {
      // file may not exist yet
    }

    const trimmedUrl = url.trim();
    const displayTitle = title?.trim() || trimmedUrl;

    const recommendation: BookRecommendation = {
      id: randomUUID(),
      title: displayTitle,
      url: trimmedUrl,
      categoryId,
      categoryName: category.name,
      note: note?.trim() || undefined,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    recommendations.pending = recommendations.pending || [];
    recommendations.pending.push(recommendation);

    await writeJsonToGitHub(
      DATA_PATH,
      recommendations,
      `Add book recommendation: ${recommendation.title}`
    );

    return NextResponse.json({ success: true, id: recommendation.id });
  } catch (error: unknown) {
    console.error("Error submitting book recommendation:", error);
    return NextResponse.json(
      { error: "Failed to submit recommendation" },
      { status: 500 }
    );
  }
}
