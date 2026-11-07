/** Accent- and case-insensitive multi-term search shared by mock data and UI filters. */
const norm = (s: string) =>
  s
    .toLocaleLowerCase("en-IE")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function matchesSearch(haystack: string[], query: string | undefined) {
  if (!query?.trim()) return true;
  const terms = norm(query).split(/\s+/).filter(Boolean);
  const text = norm(haystack.join(" "));
  return terms.every((term) => text.includes(term));
}
