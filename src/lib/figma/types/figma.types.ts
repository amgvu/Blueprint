export type FigmaFile = {
  name: string;
  lastModified?: string;
  thumbnailUrl?: string;
  document: FigmaDocumentNode;
  components?: Record<string, unknown>;
  componentSets?: Record<string, unknown>;
  schemaVersion?: number;
  styles?: Record<string, unknown>;
  version?: string;
  role?: string;
  editorType?: string;
  linkAccess?: string;
};

export type FigmaNodeType =
  | "DOCUMENT"
  | "CANVAS"
  | "FRAME"
  | "TEXT"
  | "RECTANGLE"
  | "GROUP"
  | "COMPONENT"
  | "INSTANCE";

export type FigmaRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FigmaRGB = { r: number; g: number; b: number };
export type FigmaColor = FigmaRGB & { a?: number };

export type FigmaPaint = {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "IMAGE";
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  blendMode?: string;
  gradientHandlePositions?: { x: number; y: number }[];
  gradientStops?: { color: FigmaColor; position: number }[];
};

export type FigmaEffect = {
  type: "INNER_SHADOW" | "DROP_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
  radius?: number;
  visible?: boolean;
};

export type FigmaAutoLayoutMode = "NONE" | "HORIZONTAL" | "VERTICAL";
export type FigmaAxisAlign = "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";

export type FigmaConstraints = {
  horizontal: "LEFT" | "RIGHT" | "CENTER" | "LEFT_RIGHT" | "SCALE";
  vertical: "TOP" | "BOTTOM" | "CENTER" | "TOP_BOTTOM" | "SCALE";
};

export type FigmaTextStyle = {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontSize?: number;
  textAutoResize?: "HEIGHT" | "WIDTH_AND_HEIGHT" | "NONE";
  lineHeightPx?: number | null;
  letterSpacing?: number | null;
  fontStyle?: string;
  fontWeight?: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit?: string;
  paragraphSpacing?: number;
};

export type FigmaNodeBase = {
  id: string;
  name: string;
  type: FigmaNodeType;
  visible?: boolean;
  opacity?: number;
  absoluteBoundingBox?: FigmaRect;
  relativeTransform?: [[number, number, number], [number, number, number]];
  absoluteRenderBounds?: FigmaRect;
  rotation?: number;
  constraints?: FigmaConstraints;
  layoutPositioning?: "AUTO" | "ABSOLUTE";
  layoutAlign?: "INHERIT" | "STRETCH" | "MIN" | "CENTER" | "MAX";
  layoutGrow?: number;
  layoutSizingHorizontal?: "HUG" | "FILL" | "FIXED";
  layoutSizingVertical?: "HUG" | "FILL" | "FIXED";
  scrollBehavior?: "SCROLLS" | "FIXED";
  blendMode?: string;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
  effects?: FigmaEffect[];
  boundVariables?: unknown;
};

export type FigmaDocumentNode = FigmaNodeBase & {
  type: "DOCUMENT";
  children?: FigmaCanvasNode[];
};

export type FigmaCanvasNode = FigmaNodeBase & {
  type: "CANVAS";
  children?: FigmaNode[];
  backgroundColor?: FigmaColor;
  background?: FigmaPaint[];
  prototypeStartNodeID?: string | null;
  flowStartingPoints?: unknown[];
  prototypeDevice?: unknown;
};

export type FigmaFrameNode = FigmaNodeBase & {
  type: "FRAME";
  children?: FigmaNode[];
  layoutMode?: FigmaAutoLayoutMode;
  primaryAxisSizingMode?: "AUTO" | "FIXED";
  counterAxisSizingMode?: "AUTO" | "FIXED";
  layoutWrap?: "NO_WRAP" | "WRAP";
  itemSpacing?: number;
  primaryAxisAlignItems?: FigmaAxisAlign;
  counterAxisAlignItems?: FigmaAxisAlign;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  backgroundColor?: FigmaColor;
  background?: FigmaPaint[];
  clipsContent?: boolean;
  cornerSmoothing?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
};

export type FigmaTextNode = FigmaNodeBase & {
  type: "TEXT";
  characters?: string;
  style?: FigmaTextStyle;
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
};

export type FigmaRectangleNode = FigmaNodeBase & {
  type: "RECTANGLE";
  cornerSmoothing?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  strokeWeight?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
};

export type FigmaGroupNode = FigmaNodeBase & {
  type: "GROUP";
  children?: FigmaNode[];
};

export type FigmaComponentNode = FigmaNodeBase & {
  type: "COMPONENT";
  children?: FigmaNode[];
};

export type FigmaInstanceNode = FigmaNodeBase & {
  type: "INSTANCE";
  children?: FigmaNode[];
  componentId?: string;
};

export type FigmaNode =
  | FigmaFrameNode
  | FigmaTextNode
  | FigmaRectangleNode
  | FigmaGroupNode
  | FigmaComponentNode
  | FigmaInstanceNode;

export type FigmaTreeNode = FigmaDocumentNode | FigmaCanvasNode | FigmaNode;

