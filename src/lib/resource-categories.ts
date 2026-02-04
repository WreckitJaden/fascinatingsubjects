/**
 * Shared category constants and types. Safe to import from client components
 * (no Node.js dependencies like fs/path).
 */

export const RESOURCE_CATEGORIES = [
  { value: "general-learning", label: "General Learning" },
  { value: "peer-reviewed-papers", label: "Peer-Reviewed Papers" },
  { value: "research-databases", label: "Research Databases" },
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]["value"];
export const DEFAULT_RESOURCE_CATEGORY: ResourceCategory = "general-learning";
