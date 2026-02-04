export interface Subject {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export const subjects: Subject[] = [
  { id: 1, name: "Physics", slug: "physics" },
  { id: 2, name: "The Brain", slug: "the-brain" },
  { id: 3, name: "Cells", slug: "cells" },
  { id: 4, name: "Mathematics", slug: "mathematics", description: "The ability to calculate" },
  { id: 5, name: "AI Mechanics", slug: "ai-mechanics", description: "Underlying mechanics of AI" },
  {
    id: 6,
    name: "Commercial Markets",
    slug: "commercial-markets",
    description:
      "Trending markets, predicted to grow, use-cases. Interested in all consumer markets, what products/services exist, and what markets are booming or will begin to in the near future",
  },
  {
    id: 7,
    name: "Infrastructure Megaprojects",
    slug: "infrastructure-megaprojects",
    description: "History of physical infrastructure megaprojects: architecture, buildings, dams, railways, machines, etc",
  },
  {
    id: 8,
    name: "Psychology",
    slug: "psychology",
    description:
      "Relationships, interpersonal development, conflict mitigation, psychological development in children, teens, adults, adverse experiences",
  },
  {
    id: 9,
    name: "Language & Semantics",
    slug: "language-semantics",
    description: "Language, vocabulary, semantic studies, refined articulation",
  },
  {
    id: 10,
    name: "History of Society",
    slug: "history-of-society",
    description: "History of society, collaboration, underlying agreements, rules, ideas",
  },
  {
    id: 11,
    name: "Impactful Companies",
    slug: "impactful-companies",
    description: "Mechanics of the largest and most impactful companies throughout time",
  },
  {
    id: 12,
    name: "Chemistry",
    slug: "chemistry",
    description: "Organic, inorganic, biochemistry, materials science",
  },
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}

export function getSubjectById(id: number): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}
