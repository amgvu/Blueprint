import type { NormalizedIndex } from "../../normalize/types/normalized.types";
import {
  rgbaToCss,
  borderRadiusToCss,
  px,
  alignToJustify,
  alignToItems,
  alignSelfToCss,
  gradientToCss,
  sansFonts,
} from "./utils";
import type { ConversionOptions, CssDecls } from "./types";

export function mapFlexContainerCss(
  index: NormalizedIndex,
  id: string,
  opts: ConversionOptions = {}
): CssDecls {
  const node = index.nodes[id];
  const decls: CssDecls = {};
  const P = (n: number | undefined | null) =>
    px(n, !(opts.preserveFractionalPixels ?? false));
  if (
    node.type === "frame" ||
    node.type === "canvas" ||
    node.type === "group" ||
    node.type === "component" ||
    node.type === "instance"
  ) {
    if (node.type === "canvas" && (opts.canvasCentering ?? true)) {
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
        decls.gap = P(node.layout.gap);
      const p = node.layout.padding;
      if (p) {
        const total =
          (p.top || 0) + (p.right || 0) + (p.bottom || 0) + (p.left || 0);
        if (total > 0)
          decls.padding = [P(p.top), P(p.right), P(p.bottom), P(p.left)].join(
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grad = gradientToCss(node.style.backgroundGradient as any);
    if (grad) {
      decls["background"] = grad;
    } else {
      const bg = rgbaToCss(node.style.background);
      if (bg) decls["background-color"] = bg;
    }
    const br = borderRadiusToCss(node.style.borderRadius, P);
    if (br) decls["border-radius"] = br;
    const bw = node.style.borderWidth;
    const bc = rgbaToCss(node.style.borderColor);
    if (bw && bw > 0 && bc) decls["border"] = `${P(bw)} solid ${bc}`;
  }
  return decls;
}

export function mapChildCss(
  index: NormalizedIndex,
  id: string,
  parentId: string | null,
  opts: ConversionOptions = {}
): { classDecls: CssDecls; inlineDecls: CssDecls } {
  const node = index.nodes[id];
  const parent = parentId ? index.nodes[parentId] : undefined;
  const classDecls: CssDecls = {};
  const inlineDecls: CssDecls = {};

  const parentLayout = parent?.layout?.mode;
  const P = (n: number | undefined | null) =>
    px(n, !(opts.preserveFractionalPixels ?? false));

  if (node.sizing.position !== "absolute") {
    if (node.sizing.width === "fixed" && node.sizing.widthPx != null)
      classDecls.width = P(node.sizing.widthPx);
    if (node.sizing.height === "fixed" && node.sizing.heightPx != null)
      classDecls.height = P(node.sizing.heightPx);

    if (node.sizing.width === "fill") {
      if (parentLayout === "horizontal") {
        const grow =
          node.sizing.grow && node.sizing.grow > 0 ? node.sizing.grow : 1;
        classDecls["flex"] = `${grow} 1 0`;
      } else if (parentLayout === "vertical") {
        if (!node.sizing.alignSelf) classDecls["align-self"] = "stretch";
      } else if (parentLayout === "none" || !parentLayout) {
        classDecls.width = "100%";
      }
    }

    if (node.sizing.height === "fill") {
      if (parentLayout === "vertical") {
        const grow =
          node.sizing.grow && node.sizing.grow > 0 ? node.sizing.grow : 1;
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
    if (node.text?.fontSize != null)
      classDecls["font-size"] = P(node.text.fontSize);
    if (node.text?.fontWeight != null)
      classDecls["font-weight"] = `${node.text.fontWeight}`;
    classDecls["font-family"] = sansFonts;
    if (node.text?.lineHeightPx != null)
      classDecls["line-height"] = P(node.text.lineHeightPx || 0);
    const colorCss = rgbaToCss(node.text?.color || undefined);
    if (colorCss) classDecls["color"] = colorCss;
    if (node.text?.letterSpacing != null)
      classDecls["letter-spacing"] = P(node.text.letterSpacing);
    if (node.text?.fontStyle && /italic/i.test(node.text.fontStyle))
      classDecls["font-style"] = "italic";
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

  if (
    node.type === "text" &&
    (opts.centeredTextMode ?? "auto") !== "constraints"
  ) {
    const wp = node.sizing.widthPx;
    const pw = parent?.sizing?.widthPx;
    const wantsCenter = node.text?.textAlign === "center";
    if (wantsCenter && wp && pw && pw > wp) {
      classDecls.width = P(wp);
      classDecls.margin = "0 auto";
    }
  }

  const parentNone = parent && parent.layout?.mode === "none";
  const shouldAbsolute =
    node.sizing.position === "absolute" ||
    (!!parentNone && (opts.forceAbsoluteUnderNone ?? true));
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
        const topPx = P(childAbs.y - parentAbs.y);

        if (constraints?.horizontal === "center") {
          inlineDecls.left = P(expectedCenteredLeft);
        } else if (constraints?.horizontal === "left_right") {
          const right =
            parentAbs.x +
            parentAbs.width -
            padR -
            (childAbs.x + childAbs.width);
          inlineDecls.left = P(currentLeft);
          inlineDecls.right = P(right);
        } else if (constraints?.horizontal === "right") {
          const right =
            parentAbs.x +
            parentAbs.width -
            padR -
            (childAbs.x + childAbs.width);
          inlineDecls.right = P(right);
        } else {
          if (node.type === "text") {
            const mode = opts.centeredTextMode ?? "auto";
            if (
              mode === "auto" &&
              (node.text?.textAlign === "center" || isGeomCentered)
            ) {
              inlineDecls.left = P(expectedCenteredLeft);
              classDecls["text-align"] = "center";
            } else {
              if (node.text?.textAlign === "center")
                classDecls["text-align"] = "center";
              inlineDecls.left = P(currentLeft);
            }
          } else {
            inlineDecls.left = P(currentLeft);
          }
        }
        if (constraints?.vertical === "center") {
          const padT = parent?.layout?.padding?.top ?? 0;
          const padB = parent?.layout?.padding?.bottom ?? 0;
          const contentHeight = parentAbs.height - padT - padB;
          const expectedCenteredTop =
            padT + (contentHeight - childAbs.height) / 2;
          inlineDecls.top = P(expectedCenteredTop);
        } else if (constraints?.vertical === "top_bottom") {
          const padB = parent?.layout?.padding?.bottom ?? 0;
          const bottom =
            parentAbs.y +
            parentAbs.height -
            padB -
            (childAbs.y + childAbs.height);
          inlineDecls.top = topPx;
          inlineDecls.bottom = P(bottom);
        } else if (constraints?.vertical === "bottom") {
          const padB = parent?.layout?.padding?.bottom ?? 0;
          const bottom =
            parentAbs.y +
            parentAbs.height -
            padB -
            (childAbs.y + childAbs.height);
          inlineDecls.bottom = P(bottom);
        } else {
          inlineDecls.top = topPx;
        }
      }
    }
    const stretchX = node.sizing.constraints?.horizontal === "left_right";
    const stretchY = node.sizing.constraints?.vertical === "top_bottom";
    if (!stretchX) inlineDecls.width = P(node.absolute.width);
    if (!stretchY) inlineDecls.height = P(node.absolute.height);
  }

  return { classDecls, inlineDecls };
}
