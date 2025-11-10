import type { NormalizedIndex } from "../../normalize/types/normalized.types";
import { computeParentsNeedingRelative } from "../layout";
import type { ConversionOptions } from "../layout";
import { ClassRegistry } from "./registry";
import { buildRenderTree, emitHtml } from "./build";

export function generateFromIndex(
  index: NormalizedIndex,
  options?: ConversionOptions
): { html: string; css: string } {
  const registry = new ClassRegistry();
  const opts: Required<ConversionOptions> = {
    canvasCentering: true,
    preserveFractionalPixels: false,
    centeredTextMode: "auto",
    forceAbsoluteUnderNone: true,
    cssFormat: "compact",
    htmlFormat: "fragment",
    cssHref: "styles.css",
    htmlTitle: "Figma Export",
    ...(options || {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  const needsRelative = computeParentsNeedingRelative(index, opts);
  const root = buildRenderTree(
    index,
    index.rootId,
    registry,
    needsRelative,
    null,
    opts
  ) || {
    id: index.rootId,
    tag: "div",
    classNames: [],
    inline: {},
    children: [],
  };
  const bodyHtml = emitHtml(root, 0);
  const html =
    opts.htmlFormat === "document"
      ? `<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>${opts.htmlTitle}</title>\n    <link rel=\"stylesheet\" href=\"${opts.cssHref}\" />\n  </head>\n  <body>\n${bodyHtml}\n  </body>\n</html>`
      : bodyHtml;
  const css = registry.cssText(opts.cssFormat);
  return { html, css };
}

export type { ConversionOptions } from "../layout";
