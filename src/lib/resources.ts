import fs from "fs";
import path from "path";

export interface Resource {
  url: string;
  addedAt: string;
}

const resourcesFilePath = path.join(process.cwd(), "data", "resources.json");

function readResources(): Record<string, Resource[]> {
  try {
    if (!fs.existsSync(resourcesFilePath)) {
      return {};
    }
    const fileContent = fs.readFileSync(resourcesFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading resources:", error);
    return {};
  }
}

function writeResources(resources: Record<string, Resource[]>): void {
  try {
    // Check if we're on Vercel (read-only filesystem)
    if (process.env.VERCEL) {
      throw new Error(
        "Cannot write to filesystem on Vercel. Resources can only be added locally. " +
        "Push changes to git and redeploy, or implement GitHub API integration."
      );
    }
    
    const dir = path.dirname(resourcesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing resources:", error);
    throw error;
  }
}

export async function getResourcesForSubject(subjectId: number): Promise<Resource[]> {
  const resources = readResources();
  return resources[subjectId.toString()] || [];
}

export async function addResourceToSubject(
  subjectId: number,
  url: string
): Promise<void> {
  const resources = readResources();
  const subjectKey = subjectId.toString();

  if (!resources[subjectKey]) {
    resources[subjectKey] = [];
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  // Check if URL already exists
  if (resources[subjectKey].some((r) => r.url === url)) {
    throw new Error("Resource already exists");
  }

  resources[subjectKey].push({
    url,
    addedAt: new Date().toISOString(),
  });

  writeResources(resources);
}
