import type { FigmaColor } from "../../types/figma.types";
import type { RGBA } from "../types/normalized.types";

export function toRgba(c?: FigmaColor): RGBA | null {
  if (!c) return null;
  const a = c.a === undefined ? 1 : c.a;
  return { r: c.r, g: c.g, b: c.b, a };
}
