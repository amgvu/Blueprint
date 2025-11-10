export function serializeDecls(decls: Record<string, string>): string {
  const keys = Object.keys(decls).sort();
  return keys.map((k) => `${k}:${decls[k]};`).join("");
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
