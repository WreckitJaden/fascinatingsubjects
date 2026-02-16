import { NextResponse } from "next/server";
import { readReadingListData } from "@/lib/reading-list-data";

export async function GET() {
  try {
    const data = await readReadingListData();
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
