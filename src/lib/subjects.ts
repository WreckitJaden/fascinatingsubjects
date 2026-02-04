export interface Subject {
  id: number;
  name: string;
  slug: string;
}

export const subjects: Subject[] = [
  { id: 1, name: "Physics", slug: "physics" },
  { id: 2, name: "The Brain", slug: "the-brain" },
  { id: 3, name: "Cells", slug: "cells" },
  { id: 4, name: "Mathematics", slug: "mathematics" },
  { id: 5, name: "AI Mechanics", slug: "ai-mechanics" },
  { id: 6, name: "Commercial Markets", slug: "commercial-markets" },
  { id: 7, name: "Infrastructure Megaprojects", slug: "infrastructure-megaprojects" },
  { id: 8, name: "Psychology", slug: "psychology" },
  { id: 9, name: "Language & Semantics", slug: "language-semantics" },
  { id: 10, name: "History of Society", slug: "history-of-society" },
  { id: 11, name: "Impactful Companies", slug: "impactful-companies" },
  { id: 12, name: "Chemistry", slug: "chemistry" },
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}

export function getSubjectById(id: number): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}
