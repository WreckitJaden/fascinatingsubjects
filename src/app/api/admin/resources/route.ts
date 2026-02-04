import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subjectId, url } = body;

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

    // Read resources
    const resources = await readJsonFromGitHub<
      Record<string, Array<{ url: string; addedAt: string }>>
    >("data/resources.json");

    const subjectKey = subjectId.toString();
    if (!resources[subjectKey]) {
      resources[subjectKey] = [];
    }

    // Check if already exists
    if (resources[subjectKey].some((r) => r.url === url)) {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 400 }
      );
    }

    // Add resource
    resources[subjectKey].push({
      url,
      addedAt: new Date().toISOString(),
    });

    // Write back to GitHub
    await writeJsonToGitHub(
      "data/resources.json",
      resources,
      `Add resource to subject ${subjectId}: ${url}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const url = searchParams.get("url");

    if (!subjectId || !url) {
      return NextResponse.json(
        { error: "Subject ID and URL are required" },
        { status: 400 }
      );
    }

    // Read resources
    const resources = await readJsonFromGitHub<
      Record<string, Array<{ url: string; addedAt: string }>>
    >("data/resources.json");

    const subjectKey = subjectId.toString();
    if (!resources[subjectKey]) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Remove resource
    resources[subjectKey] = resources[subjectKey].filter((r) => r.url !== url);

    // Write back to GitHub
    await writeJsonToGitHub(
      "data/resources.json",
      resources,
      `Delete resource from subject ${subjectId}: ${url}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 }
    );
  }
}
