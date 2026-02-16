import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";
import type { ReadingListData } from "@/lib/reading-list";
import fs from "fs";
import path from "path";

const DATA_PATH = "data/reading-list.json";

function localPath(): string {
  return path.join(process.cwd(), DATA_PATH);
}

/**
 * Read reading list from GitHub, with fallback to local file when
 * GITHUB_TOKEN is not set or GitHub is unavailable (e.g. local dev).
 */
export async function readReadingListData(): Promise<ReadingListData> {
  try {
    const data = await readJsonFromGitHub<ReadingListData>(DATA_PATH);
    if (data && typeof data === "object" && Array.isArray((data as ReadingListData).categories)) {
      return data as ReadingListData;
    }
  } catch {
    // Fall through to local fallback
  }

  try {
    const raw = fs.readFileSync(localPath(), "utf-8");
    const data = JSON.parse(raw) as ReadingListData;
    return data || { categories: [], next: [], currentlyReading: [] };
  } catch {
    return { categories: [], next: [], currentlyReading: [] };
  }
}

/**
 * Write reading list to GitHub, with fallback to local file when
 * GITHUB_TOKEN is not set or GitHub is unavailable.
 */
export async function writeReadingListData(
  data: ReadingListData,
  _message: string
): Promise<void> {
  try {
    await writeJsonToGitHub(DATA_PATH, data, _message);
  } catch {
    fs.writeFileSync(
      localPath(),
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }
}
