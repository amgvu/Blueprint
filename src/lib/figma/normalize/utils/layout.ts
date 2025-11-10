import type {
  FigmaAutoLayoutMode,
  FigmaConstraints,
} from "../../types/figma.types";
import type {
  AxisAlign,
  LayoutMode,
  SizeIntent,
  NormalizedConstraints,
} from "../types/normalized.types";

export function mapLayoutMode(m?: FigmaAutoLayoutMode): LayoutMode {
  if (m === "HORIZONTAL") return "horizontal";
  if (m === "VERTICAL") return "vertical";
  return "none";
}

export function mapAxisAlignMain(
  v?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"
): AxisAlign {
  if (v === "CENTER") return "center";
  if (v === "MAX") return "end";
  if (v === "SPACE_BETWEEN") return "space-between";
  return "start";
}

export function mapAxisAlignCross(
  v?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"
): AxisAlign {
  if (v === "CENTER") return "center";
  if (v === "MAX") return "end";
  return "start";
}

export function mapSizeIntent(v?: "HUG" | "FILL" | "FIXED"): SizeIntent {
  if (v === "FILL") return "fill";
  if (v === "FIXED") return "fixed";
  return "hug";
}

export function mapAlignSelf(
  v?: "INHERIT" | "STRETCH" | "MIN" | "CENTER" | "MAX"
): AxisAlign | undefined {
  if (!v || v === "INHERIT") return undefined;
  if (v === "STRETCH") return "stretch";
  if (v === "CENTER") return "center";
  if (v === "MAX") return "end";
  return "start";
}

export function mapConstraints(
  c?: FigmaConstraints
): NormalizedConstraints | undefined {
  if (!c) return undefined;
  const h: NormalizedConstraints["horizontal"] =
    c.horizontal === "LEFT"
      ? "left"
      : c.horizontal === "RIGHT"
      ? "right"
      : c.horizontal === "CENTER"
      ? "center"
      : c.horizontal === "LEFT_RIGHT"
      ? "left_right"
      : "scale";
  const v: NormalizedConstraints["vertical"] =
    c.vertical === "TOP"
      ? "top"
      : c.vertical === "BOTTOM"
      ? "bottom"
      : c.vertical === "CENTER"
      ? "center"
      : c.vertical === "TOP_BOTTOM"
      ? "top_bottom"
      : "scale";
  return { horizontal: h, vertical: v };
}
