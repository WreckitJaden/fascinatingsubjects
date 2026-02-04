import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getResourcesForSubject, addResourceToSubject } from "@/lib/resources";

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

    await addResourceToSubject(subjectIdNum, url);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add resource" },
      { status: 400 }
    );
  }
}
