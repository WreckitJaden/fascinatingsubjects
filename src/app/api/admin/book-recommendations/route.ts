import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";
import type { BookRecommendation, ReadingListBook } from "@/lib/reading-list";
import type { ReadingListData } from "@/lib/reading-list";
import { randomUUID } from "crypto";

const DATA_PATH = "data/book-recommendations.json";
const READING_LIST_PATH = "data/reading-list.json";

interface BookRecommendationsFile {
  pending: BookRecommendation[];
  approved: BookRecommendation[];
  rejected: BookRecommendation[];
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let data: BookRecommendationsFile = {
      pending: [],
      approved: [],
      rejected: [],
    };
    try {
      data = await readJsonFromGitHub<BookRecommendationsFile>(DATA_PATH);
    } catch {
      // file may not exist
    }
    return NextResponse.json({
      pending: data.pending || [],
      approved: data.approved || [],
      rejected: data.rejected || [],
    });
  } catch (error: unknown) {
    console.error("Error fetching book recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch book recommendations" },
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
        { error: "Action and recommendationId are required" },
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
      // file may not exist
    }

    const rec = (recommendations.pending || []).find(
      (r) => r.id === recommendationId
    );
    if (!rec) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      const list = await readJsonFromGitHub<ReadingListData>(READING_LIST_PATH);
      const category = (list.categories || []).find(
        (c) => c.id === rec.categoryId
      );
      if (category) {
        const book: ReadingListBook = {
          id: randomUUID(),
          title: rec.title,
          url: rec.url,
        };
        category.books = category.books || [];
        category.books.push(book);
        await writeJsonToGitHub(
          READING_LIST_PATH,
          list,
          `Add book from recommendation: ${rec.title}`
        );
      }

      const updated = {
        pending: recommendations.pending.filter((r) => r.id !== recommendationId),
        approved: [
          ...(recommendations.approved || []),
          { ...rec, status: "approved" as const },
        ],
        rejected: recommendations.rejected || [],
      };
      await writeJsonToGitHub(
        DATA_PATH,
        updated,
        `Approve book recommendation: ${rec.title}`
      );
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      const updated = {
        pending: recommendations.pending.filter((r) => r.id !== recommendationId),
        approved: recommendations.approved || [],
        rejected: [
          ...(recommendations.rejected || []),
          { ...rec, status: "rejected" as const },
        ],
      };
      await writeJsonToGitHub(
        DATA_PATH,
        updated,
        `Reject book recommendation: ${rec.title}`
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Error processing book recommendation:", error);
    return NextResponse.json(
      { error: "Failed to process recommendation" },
      { status: 500 }
    );
  }
}
