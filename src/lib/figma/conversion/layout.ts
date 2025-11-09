import type { NormalizedIndex } from "../normalize/types/normalized.types";
import type { RGBA, BorderRadius } from "../normalize/types/normalized.types";

export type CssDecls = Record<string, string>;

function px(n: number | undefined | null): string {
  const v = typeof n === "number" ? Math.round(n) : 0;
  return `${v}px`;
}

export function rgbaToCss(c?: RGBA | null): string | undefined {
  if (!c) return undefined;
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const a = Math.max(0, Math.min(1, c.a));
  if (a === 0) return undefined;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function borderRadiusToCss(b?: BorderRadius | null): string | undefined {
  if (b == null) return undefined;
  if (typeof b === "number") return px(b);
  const { topLeft, topRight, bottomRight, bottomLeft } = b;
  return `${px(topLeft)} ${px(topRight)} ${px(bottomRight)} ${px(bottomLeft)}`;
}

export function mapFlexContainerCss(
  index: NormalizedIndex,
  id: string
): CssDecls {
  const node = index.nodes[id];
  const decls: CssDecls = {};
  if (
    node.type === "frame" ||
    node.type === "canvas" ||
    node.type === "group" ||
    node.type === "component" ||
    node.type === "instance"
  ) {
    if (node.type === "canvas") {
      decls.display = "flex";
      decls["justify-content"] = "center";
      decls["align-items"] = "center";
      decls["min-height"] = "100vh";
      decls.width = "100%";
    }
    if (node.layout.mode === "horizontal" || node.layout.mode === "vertical") {
      decls.display = "flex";
      decls["flex-direction"] =
        node.layout.mode === "horizontal" ? "row" : "column";
      if (node.layout.gap != null && node.layout.gap > 0)
        decls.gap = px(node.layout.gap);
      const p = node.layout.padding;
      if (p) {
        const total = (p.top || 0) + (p.right || 0) + (p.bottom || 0) + (p.left || 0);
        if (total > 0)
          decls.padding = [px(p.top), px(p.right), px(p.bottom), px(p.left)].join(
            " "
          );
      }
      if (node.layout.align) {
        if (node.layout.align.main)
          decls["justify-content"] = alignToJustify(node.layout.align.main);
        if (node.layout.align.cross)
          decls["align-items"] = alignToItems(node.layout.align.cross);
      }
      if (node.layout.wrap) decls["flex-wrap"] = "wrap";
      if (node.layout.clipsContent) decls.overflow = "hidden";
    }
  }
  if (node.type !== "text") {
    const bg = rgbaToCss(node.style.background);
    if (bg) decls["background-color"] = bg;
    const br = borderRadiusToCss(node.style.borderRadius);
    if (br) decls["border-radius"] = br;
  }
  return decls;
}

export function mapChildCss(
  index: NormalizedIndex,
  id: string,
  parentId: string | null
): { classDecls: CssDecls; inlineDecls: CssDecls } {
  const node = index.nodes[id];
  const parent = parentId ? index.nodes[parentId] : undefined;
  const classDecls: CssDecls = {};
  const inlineDecls: CssDecls = {};

  const parentLayout = parent?.layout?.mode;

  if (node.sizing.position !== "absolute") {
    if (node.sizing.width === "fixed" && node.sizing.widthPx != null)
      classDecls.width = px(node.sizing.widthPx);
    if (node.sizing.height === "fixed" && node.sizing.heightPx != null)
      classDecls.height = px(node.sizing.heightPx);

    if (node.sizing.width === "fill") {
      if (parentLayout === "horizontal") {
        const grow = node.sizing.grow && node.sizing.grow > 0 ? node.sizing.grow : 1;
        classDecls["flex"] = `${grow} 1 0`;
      } else if (parentLayout === "vertical") {
        if (!node.sizing.alignSelf) classDecls["align-self"] = "stretch";
      } else if (parentLayout === "none" || !parentLayout) {
        classDecls.width = "100%";
      }
    }

    if (node.sizing.height === "fill") {
      if (parentLayout === "vertical") {
        const grow = node.sizing.grow && node.sizing.grow > 0 ? node.sizing.grow : 1;
        classDecls["flex"] = `${grow} 1 0`;
      } else if (parentLayout === "horizontal") {
        if (!node.sizing.alignSelf) classDecls["align-self"] = "stretch";
      } else if (parentLayout === "none" || !parentLayout) {
        classDecls.height = "100%";
      }
    }

    if (node.sizing.alignSelf)
      classDecls["align-self"] = alignSelfToCss(node.sizing.alignSelf);

    if (!classDecls["flex"] && node.sizing.grow && node.sizing.grow > 0)
      classDecls["flex-grow"] = `${node.sizing.grow}`;
  }

  if (node.type === "text") {
    classDecls.margin = "0";
  }
  if (node.type === "text" && node.text && node.text.textAlign) {
    classDecls["text-align"] =
      node.text.textAlign === "justified" ? "justify" : node.text.textAlign;
  }
  if (
    node.type === "text" &&
    node.text?.characters &&
    node.text.characters.includes("\n")
  ) {
    classDecls["white-space"] = "pre-line";
  }

  if (node.type === "text") {
    const wp = node.sizing.widthPx;
    const pw = parent?.sizing?.widthPx;
    const wantsCenter = node.text?.textAlign === "center";
    if (wantsCenter && wp && pw && pw > wp) {
      classDecls.width = px(wp);
      classDecls.margin = "0 auto";
    }
  }

  const parentNone = parent && parent.layout?.mode === "none";
  const shouldAbsolute = node.sizing.position === "absolute" || !!parentNone;
  if (shouldAbsolute && node.absolute) {
    inlineDecls.position = "absolute";
    const pId = parentId ? parentId : null;
    if (pId) {
      const parentAbs = index.nodes[pId]?.absolute;
      const childAbs = node.absolute;
      if (parentAbs && childAbs) {
        const padL = parent?.layout?.padding?.left ?? 0;
        const padR = parent?.layout?.padding?.right ?? 0;
        const currentLeft = childAbs.x - parentAbs.x;
        const contentWidth = parentAbs.width - padL - padR;
        const expectedCenteredLeft = padL + (contentWidth - childAbs.width) / 2;
        const isGeomCentered =
          Math.abs(
            Math.round(currentLeft) - Math.round(expectedCenteredLeft)
          ) <= 2;

        const constraints = node.sizing.constraints;
        const topPx = px(childAbs.y - parentAbs.y);

        if (constraints?.horizontal === "center") {
          inlineDecls.left = px(expectedCenteredLeft);
        } else if (constraints?.horizontal === "right") {
          const right = parentAbs.x + parentAbs.width - padR - (childAbs.x + childAbs.width);
          inlineDecls.right = px(right);
        } else {
          if (
            node.type === "text" &&
            (node.text?.textAlign === "center" || isGeomCentered)
          ) {
            inlineDecls.left = px(expectedCenteredLeft);
            classDecls["text-align"] = "center";
          } else {
            inlineDecls.left = px(currentLeft);
          }
        }
        if (constraints?.vertical === "center") {
          const padT = parent?.layout?.padding?.top ?? 0;
          const padB = parent?.layout?.padding?.bottom ?? 0;
          const contentHeight = parentAbs.height - padT - padB;
          const expectedCenteredTop = padT + (contentHeight - childAbs.height) / 2;
          inlineDecls.top = px(expectedCenteredTop);
        } else if (constraints?.vertical === "bottom") {
          const padB = parent?.layout?.padding?.bottom ?? 0;
          const bottom = parentAbs.y + parentAbs.height - padB - (childAbs.y + childAbs.height);
          inlineDecls.bottom = px(bottom);
        } else {
          inlineDecls.top = topPx;
        }
      }
    }
    inlineDecls.width = px(node.absolute.width);
    inlineDecls.height = px(node.absolute.height);
  }

  return { classDecls, inlineDecls };
}

export function computeParentsNeedingRelative(
  index: NormalizedIndex
): Set<string> {
  const set = new Set<string>();
  for (const id of index.order) {
    const node = index.nodes[id];
    if (node.sizing.position === "absolute") {
      const parent = index.parents[id];
      if (parent) set.add(parent);
    }
    if (
      node.layout?.mode === "none" &&
      index.children[id] &&
      index.children[id].length > 0
    ) {
      set.add(id);
    }
  }
  return set;
}

function alignToJustify(v: string): string {
  if (v === "center") return "center";
  if (v === "end") return "flex-end";
  if (v === "space-between") return "space-between";
  return "flex-start";
}

function alignToItems(v: string): string {
  if (v === "center") return "center";
  if (v === "end") return "flex-end";
  if (v === "stretch") return "stretch";
  return "flex-start";
}

function alignSelfToCss(v: string): string {
  if (v === "center") return "center";
  if (v === "end") return "flex-end";
  if (v === "stretch") return "stretch";
  return "flex-start";
}
