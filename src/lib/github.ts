import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = "WreckitJaden";
const REPO = "fascinatingsubjects";
const BRANCH = "main";

export interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

/**
 * Read a file from GitHub repository
 */
export async function readFileFromGitHub(path: string): Promise<string> {
  try {
    const response = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH,
    });

    if ("content" in response.data && "encoding" in response.data) {
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      return content;
    }

    throw new Error("File not found or is not a file");
  } catch (error: any) {
    if (error.status === 404) {
      return ""; // File doesn't exist yet
    }
    throw error;
  }
}

/**
 * Get the SHA of a file (needed for updates)
 */
async function getFileSha(path: string): Promise<string | null> {
  try {
    const response = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH,
    });

    if ("sha" in response.data) {
      return response.data.sha;
    }
    return null;
  } catch (error: any) {
    if (error.status === 404) {
      return null; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Create or update a file in GitHub repository
 */
export async function writeFileToGitHub(
  path: string,
  content: string,
  message: string
): Promise<void> {
  const sha = await getFileSha(path);

  const fileContent = Buffer.from(content).toString("base64");

  if (sha) {
    // Update existing file
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path,
      message,
      content: fileContent,
      sha,
      branch: BRANCH,
    });
  } else {
    // Create new file
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path,
      message,
      content: fileContent,
      branch: BRANCH,
    });
  }
}

/**
 * Read and parse JSON file from GitHub
 */
export async function readJsonFromGitHub<T>(path: string): Promise<T> {
  const content = await readFileFromGitHub(path);
  if (!content) {
    return {} as T;
  }
  return JSON.parse(content);
}

/**
 * Write JSON file to GitHub
 */
export async function writeJsonToGitHub<T>(
  path: string,
  data: T,
  message: string
): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await writeFileToGitHub(path, content, message);
}
