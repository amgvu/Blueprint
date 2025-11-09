export type RGBA = { r: number; g: number; b: number; a: number };

export type AxisAlign = "start" | "center" | "end" | "space-between" | "stretch";

export type LayoutMode = "none" | "horizontal" | "vertical";

export type SizeIntent = "hug" | "fill" | "fixed";

export type NormalizedConstraints = {
  horizontal: "left" | "right" | "center" | "left_right" | "scale";
  vertical: "top" | "bottom" | "center" | "top_bottom" | "scale";
};

export type BorderRadius =
  | number
  | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };

export type NormalizedNodeType =
  | "root"
  | "canvas"
  | "frame"
  | "text"
  | "rectangle"
  | "group"
  | "component"
  | "instance";

export type NormalizedSizing = {
  width: SizeIntent;
  height: SizeIntent;
  widthPx?: number;
  heightPx?: number;
  grow?: number;
  alignSelf?: AxisAlign;
  position: "static" | "absolute";
  constraints?: NormalizedConstraints;
};

export type NormalizedLayout = {
  mode: LayoutMode;
  gap?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  align: { main: AxisAlign; cross: AxisAlign };
  wrap?: boolean;
  clipsContent?: boolean;
};

export type NormalizedStyle = {
  background?: RGBA | null;
  borderRadius?: BorderRadius | null;
};

export type NormalizedText = {
  characters?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right" | "justified";
};

export type NormalizedNode = {
  id: string;
  name: string;
  type: NormalizedNodeType;
  children?: NormalizedNode[];
  layout: NormalizedLayout;
  sizing: NormalizedSizing;
  absolute?: { x: number; y: number; width: number; height: number };
  style: NormalizedStyle;
  text?: NormalizedText;
};

export type NormalizedShallowNode = Omit<NormalizedNode, "children">;

export type NormalizedIndex = {
  rootId: string;
  nodes: Record<string, NormalizedShallowNode>;
  parents: Record<string, string | null>;
  children: Record<string, string[]>;
  order: string[];
  path: Record<string, string[]>;
  byType?: Partial<Record<NormalizedNodeType, string[]>>;
  depth: Record<string, number>;
};

export type NormalizedOutput = {
  root: NormalizedNode;
  index: NormalizedIndex;
};
