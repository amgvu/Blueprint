/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FigmaDocumentNode,
  FigmaFile,
  FigmaFrameNode,
  FigmaNode,
  FigmaTreeNode,
} from "../types/figma.types";
import type {
  AxisAlign,
  LayoutMode,
  NormalizedNode,
  NormalizedText,
} from "./types/normalized.types";
import type { NormalizedOutput } from "./types/normalized.types";
import { toRgba } from "./utils/color";
import {
  mapAlignSelf,
  mapAxisAlignCross,
  mapAxisAlignMain,
  mapLayoutMode,
  mapSizeIntent,
  mapConstraints,
} from "./utils/layout";
import { mapBorderRadius } from "./utils/style";
import { figmaTypeToNormalizedType } from "./utils/types";
import { createIndex } from "./flatten";

function normalizeFrameLike(
  node: FigmaFrameNode,
  children: NormalizedNode[]
): NormalizedNode {
  const mode = mapLayoutMode(node.layoutMode);
  const layout = {
    mode,
    gap: node.itemSpacing ?? undefined,
    padding:
      node.paddingTop !== undefined
        ? {
            top: node.paddingTop || 0,
            right: node.paddingRight || 0,
            bottom: node.paddingBottom || 0,
            left: node.paddingLeft || 0,
          }
        : undefined,
    align: {
      main: mapAxisAlignMain(node.primaryAxisAlignItems),
      cross: mapAxisAlignCross(node.counterAxisAlignItems),
    },
    wrap: node.layoutWrap === "WRAP" ? true : false,
    clipsContent: !!node.clipsContent,
  } as const;
  const sizing = {
    width: mapSizeIntent(node.layoutSizingHorizontal),
    height: mapSizeIntent(node.layoutSizingVertical),
    widthPx: node.absoluteBoundingBox?.width,
    heightPx: node.absoluteBoundingBox?.height,
    grow: node.layoutGrow,
    alignSelf: mapAlignSelf(node.layoutAlign),
    position: node.layoutPositioning === "ABSOLUTE" ? "absolute" : "static",
    constraints: mapConstraints(node.constraints),
  } as const;
  const absolute = node.absoluteBoundingBox
    ? {
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
      }
    : undefined;
  const style = {
    background: toRgba(node.backgroundColor) || null,
    borderRadius: mapBorderRadius(node.cornerRadius, node.rectangleCornerRadii),
  } as const;
  return {
    id: node.id,
    name: node.name,
    type: figmaTypeToNormalizedType(node.type),
    children,
    layout,
    sizing,
    absolute,
    style,
  };
}

function normalizeLeaf(node: FigmaNode): NormalizedNode {
  const common = {
    id: node.id,
    name: node.name,
    type: figmaTypeToNormalizedType(node.type),
    layout: {
      mode: "none" as LayoutMode,
      align: { main: "start" as AxisAlign, cross: "start" as AxisAlign },
    },
    sizing: {
      width: mapSizeIntent(node.layoutSizingHorizontal),
      height: mapSizeIntent(node.layoutSizingVertical),
      widthPx: node.absoluteBoundingBox?.width,
      heightPx: node.absoluteBoundingBox?.height,
      grow: node.layoutGrow,
      alignSelf: mapAlignSelf(node.layoutAlign),
      position: node.layoutPositioning === "ABSOLUTE" ? "absolute" : "static",
      constraints: mapConstraints(node.constraints),
    },
    absolute: node.absoluteBoundingBox
      ? {
          x: node.absoluteBoundingBox.x,
          y: node.absoluteBoundingBox.y,
          width: node.absoluteBoundingBox.width,
          height: node.absoluteBoundingBox.height,
        }
      : undefined,
    style: {
      background: toRgba((node as any).backgroundColor) || null,
      borderRadius: mapBorderRadius(
        (node as any).cornerRadius,
        (node as any).rectangleCornerRadii
      ),
    },
  } as const;
  if (node.type === "TEXT") {
    const text: NormalizedText = {
      characters: node.characters,
      fontFamily: node.style?.fontFamily,
      fontSize: node.style?.fontSize,
      fontWeight: node.style?.fontWeight,
      lineHeightPx: node.style?.lineHeightPx ?? null,
      textAlign:
        node.textAlignHorizontal === "CENTER"
          ? "center"
          : node.textAlignHorizontal === "RIGHT"
          ? "right"
          : node.textAlignHorizontal === "JUSTIFIED"
          ? "justified"
          : "left",
    };
    return { ...common, text };
  }
  return common;
}

export function normalizeTree(root: FigmaTreeNode): NormalizedNode {
  if (root.type === "DOCUMENT") {
    const children = (root.children || []).map(normalizeTree);
    return {
      id: root.id,
      name: root.name,
      type: "root",
      children,
      layout: { mode: "none", align: { main: "start", cross: "start" } },
      sizing: { width: "hug", height: "hug", position: "static" },
      style: {},
    } as NormalizedNode;
  }
  if (root.type === "CANVAS") {
    const children = (root.children || []).map(normalizeTree);
    return {
      id: root.id,
      name: root.name,
      type: "canvas",
      children,
      layout: { mode: "none", align: { main: "start", cross: "start" } },
      sizing: { width: "hug", height: "hug", position: "static" },
      style: { background: toRgba(root.backgroundColor) || null },
    } as NormalizedNode;
  }
  if (root.type === "FRAME") {
    const children = (root.children || []).map(normalizeTree);
    return normalizeFrameLike(root, children);
  }
  if (
    root.type === "GROUP" ||
    root.type === "COMPONENT" ||
    root.type === "INSTANCE"
  ) {
    const children = (root.children || []).map(normalizeTree);
    const base = normalizeLeaf(root);
    return { ...base, children } as NormalizedNode;
  }
  return normalizeLeaf(root as FigmaNode);
}

export function normalizeFile(file: FigmaFile): NormalizedNode {
  const doc: FigmaDocumentNode = file.document;
  return normalizeTree(doc);
}

export function normalizeFileWithIndex(file: FigmaFile): NormalizedOutput {
  const root = normalizeFile(file);
  const index = createIndex(root);
  return { root, index };
}

export { createIndex };
