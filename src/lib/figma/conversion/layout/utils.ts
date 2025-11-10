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
  const aClamped = Math.max(0, Math.min(1, c.a));
  const aRounded = Math.round(aClamped * 10) / 10;
  if (aRounded === 0) return undefined;
  const aStr = aRounded === 1 || aRounded === 0 ? String(aRounded) : aRounded.toFixed(1);
  return `rgba(${r}, ${g}, ${b}, ${aStr})`;
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

export const sansFonts =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";

export function fontFamilyWithSansFallback(
  name?: string | null
): string | undefined {
  if (!name || typeof name !== "string") return undefined;
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const quoted = /\s/.test(trimmed) ? `'${trimmed}'` : trimmed;
  return `${quoted}, ${sansFonts}`;
}

export function formatPaddingDecl(
  p?: { top: number; right: number; bottom: number; left: number },
  toPx: (n: number | undefined | null) => string = px
): string | undefined {
  if (!p) return undefined;
  const total = (p.top || 0) + (p.right || 0) + (p.bottom || 0) + (p.left || 0);
  if (total <= 0) return undefined;
  return [toPx(p.top), toPx(p.right), toPx(p.bottom), toPx(p.left)].join(" ");
}

type Box = { x: number; y: number; width: number; height: number };

export function computeRightOffset(
  parent: Box,
  child: Box,
  padRight: number
): number {
  return parent.x + parent.width - padRight - (child.x + child.width);
}

export function computeBottomOffset(
  parent: Box,
  child: Box,
  padBottom: number
): number {
  return parent.y + parent.height - padBottom - (child.y + child.height);
}

export function isHorizCenteredByGeometry(
  currentLeft: number,
  expectedLeft: number,
  tolerance: number = 2
): boolean {
  return (
    Math.abs(Math.round(currentLeft) - Math.round(expectedLeft)) <= tolerance
  );
}
