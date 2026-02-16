import { NextResponse } from "next/server";
import { readJsonFromGitHub } from "@/lib/github";
import type { ReadingListData } from "@/lib/reading-list";

const DATA_PATH = "data/reading-list.json";

export async function GET() {
  try {
    const data = await readJsonFromGitHub<ReadingListData>(DATA_PATH);
    const categories = (data.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
    }));
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
