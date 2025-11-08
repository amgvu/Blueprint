export type RGBA = { r: number; g: number; b: number; a: number };

export type AxisAlign = "start" | "center" | "end" | "space-between" | "stretch";

export type LayoutMode = "none" | "horizontal" | "vertical";

export type SizeIntent = "hug" | "fill" | "fixed";

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

