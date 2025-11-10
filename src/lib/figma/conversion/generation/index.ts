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
  const html = emitHtml(root, 0);
  const css = registry.cssText();
  return { html, css };
}

export type { ConversionOptions } from "../layout";
