import type { BorderRadius } from "../types/normalized.types";

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
