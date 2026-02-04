import fs from "fs";
import path from "path";
import { readJsonFromGitHub, writeJsonToGitHub } from "./github";
import {
  DEFAULT_RESOURCE_CATEGORY,
  type ResourceCategory,
} from "./resource-categories";

export { RESOURCE_CATEGORIES, DEFAULT_RESOURCE_CATEGORY } from "./resource-categories";
export type { ResourceCategory } from "./resource-categories";

export interface Resource {
  url: string;
  addedAt: string;
  explored?: boolean;
  category?: ResourceCategory;
}

const resourcesFilePath = path.join(process.cwd(), "data", "resources.json");

export async function readResources(): Promise<Record<string, Resource[]>> {
  // On Vercel, use GitHub API; locally, use filesystem
  if ((process.env.VERCEL || process.env.GITHUB_TOKEN) && process.env.GITHUB_TOKEN) {
    try {
      return await readJsonFromGitHub<Record<string, Resource[]>>("data/resources.json");
    } catch (error) {
      console.error("Error reading resources from GitHub:", error);
      // Fall through to filesystem fallback
    }
  }

  // Local filesystem fallback
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

export async function writeResources(
  resources: Record<string, Resource[]>,
  message: string = "Update resources"
): Promise<void> {
  // On Vercel, use GitHub API; locally, use filesystem
  if ((process.env.VERCEL || process.env.GITHUB_TOKEN) && process.env.GITHUB_TOKEN) {
    try {
      await writeJsonToGitHub("data/resources.json", resources, message);
      return;
    } catch (error) {
      console.error("Error writing resources to GitHub:", error);
      // If on Vercel and GitHub fails, we can't use filesystem
      if (process.env.VERCEL) {
        throw new Error("GITHUB_TOKEN is required on Vercel. Please set it in environment variables.");
      }
      // Fall through to filesystem fallback for local
    }
  }

  // Local filesystem fallback
  try {
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
  const resources = await readResources();
  return resources[subjectId.toString()] || [];
}

export async function addResourceToSubject(
  subjectId: number,
  url: string,
  category: ResourceCategory = DEFAULT_RESOURCE_CATEGORY
): Promise<void> {
  const resources = await readResources();
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
    category,
  });

  await writeResources(resources, `Add resource to subject ${subjectId}: ${url}`);
}
