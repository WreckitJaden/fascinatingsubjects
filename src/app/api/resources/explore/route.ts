import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { readResources, writeResources } from "@/lib/resources";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subjectId, urls } = body;

    if (!subjectId || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Subject ID and URLs array are required" },
        { status: 400 }
      );
    }

    // Read resources
    const resources = await readResources();
    const subjectKey = subjectId.toString();

    if (!resources[subjectKey]) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Mark resources as explored
    resources[subjectKey] = resources[subjectKey].map((resource) => {
      if (urls.includes(resource.url)) {
        return { ...resource, explored: true };
      }
      return resource;
    });

    // Write back
    await writeResources(
      resources,
      `Mark ${urls.length} resource(s) as explored in subject ${subjectId}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking resources as explored:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark resources as explored" },
      { status: 500 }
    );
  }
}
