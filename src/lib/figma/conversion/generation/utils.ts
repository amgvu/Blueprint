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

export function pickTag(type: string): string {
  if (type === "text") return "p";
  return "div";
}

export function hasInline(decls: Record<string, string>): boolean {
  return Object.keys(decls).length > 0;
}

export function combineClasses(
  ...names: Array<string | null | undefined>
): string[] {
  return names.filter(Boolean) as string[];
}

export function isRenderableHtmlCandidate(
  textContent: string | undefined,
  childrenCount: number,
  classCount: number,
  inlineDecls: Record<string, string>
): boolean {
  return (
    (textContent && textContent.length > 0) ||
    childrenCount > 0 ||
    classCount > 0 ||
    hasInline(inlineDecls)
  ) as boolean;
}
