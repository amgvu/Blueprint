import type { BorderRadius } from "../types/normalized.types";
import { toRgba } from "./color";

export function buildStyleFromPaints(node: any) {
  const fills = Array.isArray(node.fills) ? node.fills : [];
  const strokes = Array.isArray(node.strokes) ? node.strokes : [];
  const style: any = {
    background: toRgba(node.backgroundColor) || null,
    backgroundGradient: null,
    borderColor: null,
    borderWidth: node.strokeWeight ?? null,
  };
  const firstVisible = fills.find((p: any) => p && p.visible !== false);
  if (firstVisible) {
    if (firstVisible.type === "SOLID" && firstVisible.color) {
      const c = toRgba(firstVisible.color);
      if (c)
        style.background = {
          r: c.r,
          g: c.g,
          b: c.b,
          a: (firstVisible.opacity ?? 1) * c.a,
        };
    } else if (
      firstVisible.type === "GRADIENT_LINEAR" &&
      firstVisible.gradientHandlePositions &&
      firstVisible.gradientHandlePositions.length >= 2 &&
      Array.isArray(firstVisible.gradientStops)
    ) {
      const h0 = firstVisible.gradientHandlePositions[0];
      const h1 = firstVisible.gradientHandlePositions[1];
      const dx = h1.x - h0.x;
      const dy = h1.y - h0.y;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = (angleRad * 180) / Math.PI;
      const stops = firstVisible.gradientStops
        .map((s: any) => ({ color: toRgba(s.color), position: s.position }))
        .filter((s: any) => !!s.color);
      if (stops.length > 0)
        style.backgroundGradient = {
          type: "linear",
          angleDeg,
          stops: stops as any,
        };
      style.background = null;
    }
  }
  const firstStroke = strokes.find(
    (p: any) => p && p.visible !== false && p.type === "SOLID" && p.color
  );
  if (firstStroke) {
    const c = toRgba(firstStroke.color);
    if (c)
      style.borderColor = {
        r: c.r,
        g: c.g,
        b: c.b,
        a: (firstStroke.opacity ?? 1) * c.a,
      };
  }
  return style;
}

export function mapBorderRadius(
  uniform?: number,
  perCorner?: [number, number, number, number]
): BorderRadius | null {
  if (typeof uniform === "number") return uniform;
  if (perCorner && perCorner.length === 4)
    return {
      topLeft: perCorner[0],
      topRight: perCorner[1],
      bottomRight: perCorner[2],
      bottomLeft: perCorner[3],
    };
  return null;
}
