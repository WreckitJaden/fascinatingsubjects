import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getResourcesForSubject, addResourceToSubject } from "@/lib/resources";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;
  const subjectIdNum = parseInt(subjectId);

  if (isNaN(subjectIdNum)) {
    return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
  }

  try {
    const resources = await getResourcesForSubject(subjectIdNum);
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId } = await params;
  const subjectIdNum = parseInt(subjectId);

  if (isNaN(subjectIdNum)) {
    return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      await addResourceToSubject(subjectIdNum, url);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      // If GitHub API fails, try direct GitHub write
      if (error.message?.includes("GitHub") || process.env.VERCEL) {
        const resources = await readJsonFromGitHub<Record<string, Array<{ url: string; addedAt: string }>>>(
          "data/resources.json"
        );
        const subjectKey = subjectIdNum.toString();
        if (!resources[subjectKey]) {
          resources[subjectKey] = [];
        }
        if (!resources[subjectKey].some((r) => r.url === url)) {
          resources[subjectKey].push({
            url,
            addedAt: new Date().toISOString(),
          });
          await writeJsonToGitHub(
            "data/resources.json",
            resources,
            `Add resource to subject ${subjectIdNum}: ${url}`
          );
          return NextResponse.json({ success: true });
        }
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add resource" },
      { status: 400 }
    );
  }
}
