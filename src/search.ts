// Stage 4: search that ignores letter case and accents ("brüche" finds "Brüche", "bruche" too).

export function foldForSearch(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when every word of the query appears in at least one of the values. An empty query matches all. */
export function matchesSearch(query: string, values: string[]) {
  const words = foldForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = values.map(foldForSearch);
  return words.every((word) => haystack.some((value) => value.includes(word)));
}
