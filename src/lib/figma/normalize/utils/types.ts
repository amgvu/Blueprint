import type { NormalizedNodeType } from "../types/normalized.types";

export function figmaTypeToNormalizedType(t: string): NormalizedNodeType {
  if (t === "DOCUMENT") return "root";
  if (t === "CANVAS") return "canvas";
  if (t === "FRAME") return "frame";
  if (t === "TEXT") return "text";
  if (t === "RECTANGLE") return "rectangle";
  if (t === "GROUP") return "group";
  if (t === "COMPONENT") return "component";
  if (t === "INSTANCE") return "instance";
  return "group";
}
