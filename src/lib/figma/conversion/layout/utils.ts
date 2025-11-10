import type {
  RGBA,
  BorderRadius,
} from "../../normalize/types/normalized.types";

export function px(n: number | undefined | null, round = true): string {
  const v =
    typeof n === "number"
      ? round
        ? Math.round(n)
        : Math.round(n * 100) / 100
      : 0;
  return `${v}px`;
}

export function rgbaToCss(c?: RGBA | null): string | undefined {
  if (!c) return undefined;
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const a = Math.max(0, Math.min(1, c.a));
  if (a === 0) return undefined;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function borderRadiusToCss(
  b?: BorderRadius | null,
  toPx?: (n: number | undefined | null) => string
): string | undefined {
  if (b == null) return undefined;
  const P = toPx || ((n: number | undefined | null) => px(n));
  if (typeof b === "number") return b === 0 ? undefined : P(b);
  const { topLeft, topRight, bottomRight, bottomLeft } = b;
  const allZero = [topLeft, topRight, bottomRight, bottomLeft].every(
    (n) => (n ?? 0) === 0
  );
  if (allZero) return undefined;
  return `${P(topLeft)} ${P(topRight)} ${P(bottomRight)} ${P(bottomLeft)}`;
}

export function gradientToCss(g?: {
  type: "linear";
  angleDeg: number;
  stops: { color: RGBA; position: number }[];
}): string | undefined {
  if (
    !g ||
    g.type !== "linear" ||
    !Array.isArray(g.stops) ||
    g.stops.length === 0
  )
    return undefined;
  const angle = `${Math.round(g.angleDeg)}deg`;
  const parts = g.stops.map(
    (s) => `${rgbaToCss(s.color)} ${Math.round((s.position || 0) * 100)}%`
  );
  return `linear-gradient(${angle}, ${parts.join(", ")})`;
}

export function alignToJustify(v: string): string {
  if (v === "center") return "center";
  if (v === "end") return "flex-end";
  if (v === "space-between") return "space-between";
  return "flex-start";
}

export function alignToItems(v: string): string {
  if (v === "center") return "center";
  if (v === "end") return "flex-end";
  if (v === "stretch") return "stretch";
  return "flex-start";
}

export function alignSelfToCss(v: string): string {
  if (v === "center") return "center";
  if (v === "end") return "flex-end";
  if (v === "stretch") return "stretch";
  return "flex-start";
}
