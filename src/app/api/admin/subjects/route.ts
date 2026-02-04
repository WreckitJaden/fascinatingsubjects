import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { readFileFromGitHub, writeFileToGitHub } from "@/lib/github";

interface Subject {
  id: number;
  name: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    // Read current subjects.ts file
    const fileContent = await readFileFromGitHub("src/lib/subjects.ts");

    // Parse the subjects array
    const subjectsMatch = fileContent.match(/export const subjects: Subject\[\] = \[([\s\S]*?)\];/);
    if (!subjectsMatch) {
      throw new Error("Could not parse subjects.ts");
    }

    // Extract existing subjects
    const existingSubjects: Subject[] = [];
    const subjectMatches = fileContent.matchAll(/\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)"\s*\}/g);
    for (const match of subjectMatches) {
      existingSubjects.push({
        id: parseInt(match[1]),
        name: match[2],
        slug: match[3],
      });
    }

    // Find max ID
    const maxId = existingSubjects.length > 0 ? Math.max(...existingSubjects.map((s) => s.id)) : 0;
    const newId = maxId + 1;
    const newSlug = slugify(name);

    // Check if slug already exists
    if (existingSubjects.some((s) => s.slug === newSlug)) {
      return NextResponse.json(
        { error: "A subject with this name already exists" },
        { status: 400 }
      );
    }

    // Add new subject
    const newSubject: Subject = {
      id: newId,
      name,
      slug: newSlug,
    };

    // Reconstruct the file
    const subjectsArray = [...existingSubjects, newSubject]
      .map((s) => `  { id: ${s.id}, name: "${s.name}", slug: "${s.slug}" }`)
      .join(",\n");

    const newFileContent = `export interface Subject {
  id: number;
  name: string;
  slug: string;
}

export const subjects: Subject[] = [
${subjectsArray}
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}

export function getSubjectById(id: number): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}
`;

    // Write back to GitHub
    await writeFileToGitHub(
      "src/lib/subjects.ts",
      newFileContent,
      `Add new subject: ${name}`
    );

    return NextResponse.json({ success: true, subject: newSubject });
  } catch (error: any) {
    console.error("Error adding subject:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add subject" },
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
    }

    const subjectId = parseInt(id);
    if (isNaN(subjectId)) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
    }

    // Read current subjects.ts file
    const fileContent = await readFileFromGitHub("src/lib/subjects.ts");

    // Parse and remove the subject
    const lines = fileContent.split("\n");
    let inSubjectsArray = false;
    let subjectStartIndex = -1;
    let braceCount = 0;
    const newLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes("export const subjects: Subject[] = [")) {
        inSubjectsArray = true;
        newLines.push(line);
        continue;
      }

      if (inSubjectsArray) {
        if (line.includes("{")) {
          if (braceCount === 0) {
            subjectStartIndex = newLines.length;
          }
          braceCount++;
        }

        if (line.includes("}")) {
          braceCount--;
          if (braceCount === 0) {
            // Check if this subject matches the ID to delete
            const subjectBlock = lines.slice(subjectStartIndex, i + 1).join("\n");
            const idMatch = subjectBlock.match(/id:\s*(\d+)/);
            if (idMatch && parseInt(idMatch[1]) === subjectId) {
              // Skip this subject (don't add it to newLines)
              continue;
            }
          }
        }

        if (braceCount === 0 && line.includes("];")) {
          inSubjectsArray = false;
        }
      }

      if (!inSubjectsArray || braceCount !== 0 || !line.match(/id:\s*\d+/)) {
        newLines.push(line);
      }
    }

    const newFileContent = newLines.join("\n");

    // Write back to GitHub
    await writeFileToGitHub(
      "src/lib/subjects.ts",
      newFileContent,
      `Delete subject with ID: ${subjectId}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete subject" },
      { status: 500 }
    );
  }
}
