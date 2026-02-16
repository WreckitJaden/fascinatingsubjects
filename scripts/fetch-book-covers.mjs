#!/usr/bin/env node
/**
 * Fetches book cover URLs from Open Library Search API and adds coverUrl to each book
 * in data/reading-list.json. Run from repo root: node scripts/fetch-book-covers.mjs
 * Rate-limited to avoid hammering the API. Only fills in books that are missing coverUrl.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "reading-list.json");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Parse "Title - Author" or "Title: Subtitle - Author" into { title, author } */
function parseTitleAuthor(full) {
  const t = full.trim();
  const dashIdx = t.lastIndexOf(" - ");
  const author = dashIdx > 0 ? t.slice(dashIdx + 3).trim() : "";
  const beforeDash = dashIdx > 0 ? t.slice(0, dashIdx).trim() : t;
  const colonIdx = beforeDash.indexOf(":");
  const title = colonIdx > 0 ? beforeDash.slice(0, colonIdx).trim() : beforeDash;
  const shortTitle = title.split(/\s+/).slice(0, 5).join(" ");
  return { title: beforeDash, shortTitle, author };
}

/** Search Open Library and return cover URL from first result that has cover_i */
async function searchOpenLibrary(params) {
  const sp = new URLSearchParams(params);
  sp.set("limit", "12");
  sp.set("fields", "cover_i,title,author_name");
  const url = `https://openlibrary.org/search.json?${sp.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const doc = (data.docs || []).find((d) => d.cover_i != null);
    if (doc?.cover_i != null) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function getCoverUrlForTitle(fullTitle) {
  if (!fullTitle?.trim()) return null;

  const { title, shortTitle, author } = parseTitleAuthor(fullTitle);

  // 1) Title + author (best match)
  if (author) {
    const u = await searchOpenLibrary({
      title: title.slice(0, 80),
      author: author.split(/\s+/).slice(0, 2).join(" "),
    });
    if (u) return u;
    await delay(300);
  }

  // 2) Full title only
  let u = await searchOpenLibrary({ title: title.slice(0, 80) });
  if (u) return u;
  await delay(300);

  // 3) Short title (first 5 words)
  if (shortTitle !== title) {
    u = await searchOpenLibrary({ title: shortTitle });
    if (u) return u;
    await delay(300);
  }

  // 4) General q= search as fallback
  try {
    const q = encodeURIComponent(title.slice(0, 60));
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=12&fields=cover_i,title`
    );
    if (res.ok) {
      const data = await res.json();
      const doc = (data.docs || []).find((d) => d.cover_i != null);
      if (doc?.cover_i != null) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

async function main() {
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);
  let updated = 0;
  const missing = [];

  for (const cat of data.categories || []) {
    for (const book of cat.books || []) {
      if (book.coverUrl) continue;
      missing.push(book);
    }
  }

  if (missing.length === 0) {
    console.log("All books already have cover URLs.");
    return;
  }

  console.log(`Filling in ${missing.length} missing cover(s)...\n`);

  for (const book of missing) {
    const coverUrl = await getCoverUrlForTitle(book.title);
    if (coverUrl) {
      book.coverUrl = coverUrl;
      updated++;
      console.log(`  ✓ ${book.title.slice(0, 55)}`);
    } else {
      console.log(`  ✗ ${book.title.slice(0, 55)}`);
    }
    await delay(400);
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\nDone. Added ${updated} cover URL(s). ${missing.length - updated} still missing.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
