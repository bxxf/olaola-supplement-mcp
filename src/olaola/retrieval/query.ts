export function normalizeRetrievalQueries(queries: string[]): string[] {
  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
}
